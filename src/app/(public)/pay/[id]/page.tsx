import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PaymentPageClient from './payment-page-client'

// Server Component to fetch data
export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      lineItems: true,
    }
  })

  if (!invoice) {
    notFound()
  }

  // Sanitize company data (remove internal fields if any)
  const safeInvoice = {
    ...invoice,
    company: {
      name: invoice.company.name,
      logo: invoice.company.logo,
      email: invoice.company.email,
      address: invoice.company.address,
      stripePricingModel: invoice.company.stripePricingModel,
      stripeAccountId: invoice.company.stripeAccountId, // Need this to know if we can accept payment
    }
  }

  return <PaymentPageClient invoice={safeInvoice} />
}



