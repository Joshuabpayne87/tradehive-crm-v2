import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { estimateSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sort = searchParams.get('sort')

    const whereClause: any = { companyId }

    if (status) whereClause.status = status
    if (customerId) whereClause.customerId = customerId
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'amount_desc') orderBy = { total: 'desc' }
    else if (sort === 'amount_asc') orderBy = { total: 'asc' }
    else if (sort === 'status') orderBy = { status: 'asc' }

    const estimates = await prisma.estimate.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { firstName: true, lastName: true }
        },
        lineItems: true
      },
      orderBy
    })

    return successResponse(estimates)
  } catch (error) {
    return errorResponse('Failed to fetch estimates', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = estimateSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    // Generate estimate number if not provided
    const estimateNumber = result.data.estimateNumber || `EST-${Math.floor(Math.random() * 1000000)}`

    // Create estimate with line items
    const estimate = await prisma.estimate.create({
      data: {
        ...result.data,
        estimateNumber,
        companyId,
        lineItems: {
          create: result.data.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
            type: item.type
          }))
        }
      },
      include: {
        lineItems: true
      }
    })

    return successResponse(estimate, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create estimate', 500)
  }
}



