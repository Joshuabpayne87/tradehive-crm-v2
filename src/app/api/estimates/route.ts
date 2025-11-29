import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { estimateSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
      console.error('Estimate validation failed:', result.error.flatten())
      return errorResponse(
        `Validation error: ${result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        400
      )
    }

    // Generate estimate number if not provided
    const estimateNumber = result.data.estimateNumber || `EST-${Date.now()}-${Math.floor(Math.random() * 1000)}`

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
            type: item.type || 'service'
          }))
        }
      },
      include: {
        lineItems: true,
        customer: true
      }
    })

    console.log('Estimate created successfully:', estimate.id)
    return successResponse(estimate, 201)
  } catch (error) {
    console.error('Estimate creation error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create estimate',
      500
    )
  }
}




