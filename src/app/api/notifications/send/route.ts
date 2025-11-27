import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { sendEmail, getEstimateEmailHtml, getInvoiceEmailHtml } from '@/lib/notifications'

// Generic notification sender
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { type, id } = await req.json() // type: 'estimate' | 'invoice'

    if (type === 'estimate') {
      const estimate = await prisma.estimate.findUnique({
        where: { id, companyId },
        include: { customer: true, company: true }
      })

      if (!estimate || !estimate.customer.email) {
        return errorResponse('Estimate or customer email not found', 404)
      }

      // Generate Portal Link
      // In real app, we'd ensure they have a portal token or generate a one-time link
      // For now, we link to the public/portal view if auth allows, or just the portal login
      // Better: Create a magic link on the fly or link to generic portal login?
      // Best for MVP: Link to a public view if we had one, or the portal login with a "next" param?
      // Let's assume user has portal access or we send them to login.
      const link = `${process.env.NEXTAUTH_URL}/portal/login` 

      await sendEmail({
        to: estimate.customer.email,
        subject: `Estimate #${estimate.estimateNumber} from ${estimate.company.name}`,
        html: getEstimateEmailHtml(estimate, link)
      })

      await prisma.estimate.update({
        where: { id },
        data: { status: 'sent' }
      })

      return successResponse({ message: 'Estimate sent' })
    }

    if (type === 'invoice') {
      const invoice = await prisma.invoice.findUnique({
        where: { id, companyId },
        include: { customer: true, company: true }
      })

      if (!invoice || !invoice.customer.email) {
        return errorResponse('Invoice or customer email not found', 404)
      }

      // Link directly to the public payment page
      const link = `${process.env.NEXTAUTH_URL}/pay/${invoice.id}`

      await sendEmail({
        to: invoice.customer.email,
        subject: `Invoice #${invoice.invoiceNumber} from ${invoice.company.name}`,
        html: getInvoiceEmailHtml(invoice, link)
      })

      await prisma.invoice.update({
        where: { id },
        data: { status: 'sent' }
      })

      return successResponse({ message: 'Invoice sent' })
    }

    return errorResponse('Invalid notification type', 400)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to send notification', 500)
  }
}



