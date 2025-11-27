import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY || process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Skip in development if no keys
  if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY) {
    console.log('📧 [DEV] Email would be sent to:', to)
    console.log('Subject:', subject)
    return
  }

  try {
    await transporter.sendMail({
      from: '"TradeHive CRM" <notifications@tradehive.com>', // Valid sender
      to,
      subject,
      html,
    })
    console.log('📧 Email sent to:', to)
  } catch (error) {
    console.error('Failed to send email:', error)
    // Don't throw, just log - notifications shouldn't break the flow
  }
}

// --- TEMPLATES ---

export function getEstimateEmailHtml(estimate: any, link: string) {
  return `
    <h1>New Estimate from ${estimate.company.name}</h1>
    <p>Hello ${estimate.customer.firstName},</p>
    <p>You have received a new estimate for <strong>$${estimate.total.toFixed(2)}</strong>.</p>
    <p>Click the link below to view and approve it:</p>
    <a href="${link}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">View Estimate</a>
    <p>Thank you,<br/>${estimate.company.name}</p>
  `
}

export function getInvoiceEmailHtml(invoice: any, link: string) {
  return `
    <h1>New Invoice from ${invoice.company.name}</h1>
    <p>Hello ${invoice.customer.firstName},</p>
    <p>You have received a new invoice for <strong>$${invoice.total.toFixed(2)}</strong>.</p>
    <p>Click the link below to view and pay online:</p>
    <a href="${link}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Pay Invoice</a>
    <p>Thank you,<br/>${invoice.company.name}</p>
  `
}

export function getPaymentReceiptHtml(payment: any, invoice: any) {
  return `
    <h1>Payment Receipt</h1>
    <p>Hello ${invoice.customer.firstName},</p>
    <p>This is a receipt for your payment of <strong>$${payment.amount.toFixed(2)}</strong> towards invoice #${invoice.invoiceNumber}.</p>
    <p>Thank you for your business!</p>
    <p>${invoice.company.name}</p>
  `
}



