import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { leadSchema } from '@/lib/validations-leads'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const query = searchParams.get('query')
    const sort = searchParams.get('sort')

    const whereClause: any = { companyId }
    
    if (status) whereClause.status = status
    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'name_asc') orderBy = { firstName: 'asc' }
    else if (sort === 'name_desc') orderBy = { firstName: 'desc' }
    else if (sort === 'status') orderBy = { status: 'asc' }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy
    })

    return successResponse(leads)
  } catch (error) {
    return errorResponse('Failed to fetch leads', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = leadSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const lead = await prisma.lead.create({
      data: {
        ...result.data,
        companyId,
      },
    })

    return successResponse(lead, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create lead', 500)
  }
}


