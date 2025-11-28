import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()

    // Fetch latest items from different models
    const [latestInvoices, latestEstimates, latestJobs, latestCustomers] = await Promise.all([
      prisma.invoice.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      prisma.estimate.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      prisma.job.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      prisma.customer.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Combine and sort
    const activity = [
      ...latestInvoices.map(inv => ({
        id: inv.id,
        type: 'invoice',
        title: `Invoice #${inv.invoiceNumber}`,
        subtitle: `Created for ${inv.customer.firstName} ${inv.customer.lastName}`,
        date: inv.createdAt,
        status: inv.status,
        amount: inv.total
      })),
      ...latestEstimates.map(est => ({
        id: est.id,
        type: 'estimate',
        title: `Estimate #${est.estimateNumber}`,
        subtitle: `Created for ${est.customer.firstName} ${est.customer.lastName}`,
        date: est.createdAt,
        status: est.status,
        amount: est.total
      })),
      ...latestJobs.map(job => ({
        id: job.id,
        type: 'job',
        title: `Job: ${job.title}`,
        subtitle: `For ${job.customer.firstName} ${job.customer.lastName}`,
        date: job.createdAt,
        status: job.status,
      })),
      ...latestCustomers.map(cust => ({
        id: cust.id,
        type: 'customer',
        title: `New Customer`,
        subtitle: `${cust.firstName} ${cust.lastName}`,
        date: cust.createdAt,
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10) // Return top 10 recent activities

    return successResponse(activity)
  } catch (error) {
    return errorResponse('Failed to fetch recent activity', 500)
  }
}

