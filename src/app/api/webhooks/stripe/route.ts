import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Route segment config for Next.js 14 App Router
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      const invoiceId = session.metadata?.invoiceId
      const companyId = session.metadata?.companyId

      if (invoiceId && companyId) {
        // 1. Record Payment
        const amountPaid = (session.amount_total || 0) / 100 // Convert cents to dollars
        
        // Check if this was a pass-through fee model, if so, subtract the fee
        // Actually, Stripe handles the split, so `amount_total` is what customer paid
        // But for our invoice record, we care about what covers the invoice balance
        // If we added a fee line item, we should probably subtract it, but for MVP simplicity:
        // We'll count the full amount towards the invoice for now, or ideally we'd parse line items.
        // A safer bet for MVP is to just mark it as paid if the session is complete.
        
        // Re-fetch invoice to get total
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
        
        if (invoice) {
          // Create Payment Record
          await prisma.payment.create({
            data: {
              companyId,
              invoiceId,
              amount: amountPaid,
              method: 'card',
              status: 'completed',
              stripePaymentId: session.payment_intent as string,
              paidAt: new Date(),
            }
          })

          // Update Invoice Status
          // If amount paid >= total, mark as paid
          // Since we only support full payment via checkout link currently:
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'paid',
              amountPaid: { increment: amountPaid },
              paidDate: new Date(),
            }
          })
          
          // Create Transaction for Accounting (Books Lite)
          await prisma.transaction.create({
            data: {
              companyId,
              type: 'income',
              category: 'Service Revenue',
              amount: amountPaid,
              description: `Payment for Invoice #${invoice.invoiceNumber}`,
              date: new Date(),
              invoiceId: invoice.id,
            }
          })
        }
      }
      break
    }
    case 'account.updated': {
      // Handle Connect account updates (e.g. verification status)
      const account = event.data.object as Stripe.Account
      // You could update DB status here if needed
      break
    }
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 })
}


