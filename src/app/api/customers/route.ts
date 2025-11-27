import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, getAuthenticatedSession, errorResponse, successResponse } from '@/lib/api-helpers'
import { customerSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const sort = searchParams.get('sort')
    
    const whereClause: any = { companyId }
    
    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'name_asc') orderBy = { firstName: 'asc' }
    else if (sort === 'name_desc') orderBy = { firstName: 'desc' }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy,
      include: {
        _count: {
          select: { jobs: true, estimates: true, invoices: true }
        }
      }
    })

    return successResponse(customers)
  } catch (error) {
    return errorResponse('Failed to fetch customers', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = customerSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const customer = await prisma.customer.create({
      data: {
        ...result.data,
        companyId,
      },
    })

    return successResponse(customer, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create customer', 500)
  }
}



