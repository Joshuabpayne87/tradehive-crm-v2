import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import * as z from 'zod'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
})

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const whereClause: any = { companyId }
    
    if (type) whereClause.type = type
    if (category) whereClause.category = category
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    })

    return successResponse(transactions)
  } catch (error) {
    return errorResponse('Failed to fetch transactions', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = transactionSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...result.data,
        companyId,
      },
    })

    return successResponse(transaction, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create transaction', 500)
  }
}
