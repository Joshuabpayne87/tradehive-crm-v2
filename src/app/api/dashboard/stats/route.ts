import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)

    // 1. Financial Stats
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      select: {
        total: true,
        amountPaid: true,
        status: true,
        createdAt: true
      }
    })

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0)
    const outstandingBalance = invoices.reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0)
    
    // Revenue this month
    const revenueThisMonth = invoices
      .filter(inv => inv.createdAt >= startOfCurrentMonth && inv.createdAt <= endOfCurrentMonth)
      .reduce((acc, inv) => acc + inv.amountPaid, 0)

    // 2. Counts
    const customersCount = await prisma.customer.count({ where: { companyId } })
    const activeJobsCount = await prisma.job.count({ 
      where: { 
        companyId,
        status: { in: ['scheduled', 'in_progress'] }
      } 
    })
    const pendingEstimatesCount = await prisma.estimate.count({
      where: {
        companyId,
        status: { in: ['draft', 'sent', 'viewed'] }
      }
    })

    // 3. Revenue History (Last 6 months) for Chart
    const revenueHistory = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      const monthLabel = format(date, 'MMM')

      const monthlyRevenue = invoices
        .filter(inv => inv.createdAt >= start && inv.createdAt <= end)
        .reduce((acc, inv) => acc + inv.amountPaid, 0)

      revenueHistory.push({ name: monthLabel, total: monthlyRevenue })
    }

    return successResponse({
      financials: {
        totalRevenue,
        outstandingBalance,
        revenueThisMonth
      },
      counts: {
        customers: customersCount,
        activeJobs: activeJobsCount,
        pendingEstimates: pendingEstimatesCount
      },
      revenueHistory
    })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to fetch dashboard stats', 500)
  }
}

