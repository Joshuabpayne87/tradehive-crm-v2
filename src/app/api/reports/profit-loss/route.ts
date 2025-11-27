import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { startOfYear, endOfYear, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    let start: Date
    let end: Date

    if (startDateParam && endDateParam) {
      start = new Date(startDateParam)
      end = new Date(endDateParam)
      // Ensure end date is end of day
      end.setHours(23, 59, 59, 999)
    } else {
      const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
      start = startOfYear(new Date(year, 0, 1))
      end = endOfYear(new Date(year, 0, 1))
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        date: {
          gte: start,
          lte: end
        }
      }
    })

    // Calculate Summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit = totalIncome - totalExpenses

    // Group by Category
    const expensesByCategory: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
      })

    const incomeByCategory: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount
      })

    return successResponse({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        margin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
      },
      breakdown: {
        income: incomeByCategory,
        expenses: expensesByCategory
      }
    })
  } catch (error) {
    return errorResponse('Failed to fetch P&L report', 500)
  }
}
