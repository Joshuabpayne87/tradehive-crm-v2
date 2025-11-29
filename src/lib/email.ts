import nodemailer from 'nodemailer'

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASS || 'pass',
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send an email using Gmail API if connected, otherwise fall back to SMTP
 */
export async function sendEmail({ to, subject, html }: EmailOptions, companyId?: string) {
  // Try Gmail API first if companyId is provided
  if (companyId) {
    try {
      const { sendEmailViaGmail } = await import('./gmail')
      const result = await sendEmailViaGmail(companyId, to, subject, html)
      if (result.success) {
        return result
      }
      console.log('Gmail send failed, falling back to SMTP')
    } catch (error) {
      console.log('Gmail not available, falling back to SMTP:', error)
    }
  }

  // Fallback to SMTP
  // Don't send emails if SMTP is not configured (dev mode)
  if (!process.env.SMTP_HOST) {
    console.log('📧 [Mock Email] To:', to)
    console.log('Subject:', subject)
    return { success: true, messageId: 'mock-id' }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"TradeHive CRM" <noreply@tradehive.com>',
      to,
      subject,
      html,
    })
    console.log('Message sent via SMTP: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to TradeHive CRM',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to TradeHive, ${name}!</h1>
        <p>We're excited to have you on board. Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>Create estimates and invoices</li>
          <li>Manage your customers</li>
          <li>Track your jobs and schedule</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        </p>
      </div>
    `,
  })
}

export async function sendInvoiceEmail(email: string, invoiceNumber: string, amount: number, link: string) {
  return sendEmail({
    to: email,
    subject: `Invoice #${invoiceNumber} from TradeHive`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Invoice Available</h1>
        <p>A new invoice has been generated for you.</p>
        <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
        <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
        <p>
          <a href="${link}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a>
        </p>
      </div>
    `,
  })
}
