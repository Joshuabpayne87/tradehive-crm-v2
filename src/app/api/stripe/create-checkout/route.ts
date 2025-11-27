import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-helpers'
import { stripe, getStripeFee } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// This is a public endpoint, so we can't check for session directly
// Instead, we'll rely on the invoice ID being valid
export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json()

    // 1. Fetch Invoice and Company
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        company: true,
        customer: true,
      }
    })

    if (!invoice) return errorResponse('Invoice not found', 404)
    if (!invoice.company.stripeAccountId) return errorResponse('Merchant not connected to Stripe', 400)

    // 2. Calculate Amounts
    const balanceDue = invoice.total - invoice.amountPaid
    if (balanceDue <= 0) return errorResponse('Invoice already paid', 400)

    // Convert to cents
    const amountInCents = Math.round(balanceDue * 100)
    
    // Calculate application fee (Stripe Connect fee)
    // Standard: We take 0.5% platform fee maybe? Or just rely on subscription?
    // For now, let's say platform takes 0.5%
    // const platformFee = Math.round(amountInCents * 0.005)
    const platformFee = 0 // Free for MVP

    // Calculate fee based on pricing model
    // If pass-through, we add a fee line item to the checkout session
    // If standard, the merchant absorbs the fee
    const pricingModel = invoice.company.stripePricingModel as 'pass_through' | 'standard' | null
    const customerFee = getStripeFee(amountInCents, pricingModel)

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice #${invoice.invoiceNumber}`,
              description: `Payment for invoice #${invoice.invoiceNumber}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
        // Add service fee line item if pass-through
        ...(customerFee > 0 ? [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Processing Fee',
              description: 'Credit card processing fee',
            },
            unit_amount: customerFee,
          },
          quantity: 1,
        }] : [])
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: invoice.company.stripeAccountId,
        },
        metadata: {
          invoiceId: invoice.id,
          companyId: invoice.companyId,
        }
      },
      metadata: {
        invoiceId: invoice.id,
        companyId: invoice.companyId,
      },
      success_url: `${process.env.NEXTAUTH_URL}/pay/${invoice.id}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pay/${invoice.id}?canceled=true`,
      customer_email: invoice.customer.email || undefined,
    })

    return successResponse({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    return errorResponse('Failed to create checkout session', 500)
  }
}


