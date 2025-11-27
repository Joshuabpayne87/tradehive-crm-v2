import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { jobSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const assignedTo = searchParams.get('assignedTo')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sort = searchParams.get('sort')

    const whereClause: any = { companyId }
    
    if (status) whereClause.status = status
    if (customerId) whereClause.customerId = customerId
    if (assignedTo) whereClause.assignedToUserId = assignedTo
    
    // Date range filtering for calendar
    if (start && end) {
      whereClause.scheduledAt = {
        gte: new Date(start),
        lte: new Date(end)
      }
    } else if (startDate && endDate) {
      whereClause.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    let orderBy: any = { scheduledAt: 'asc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'scheduled_desc') orderBy = { scheduledAt: 'desc' }
    else if (sort === 'scheduled_asc') orderBy = { scheduledAt: 'asc' }
    else if (sort === 'status') orderBy = { status: 'asc' }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { firstName: true, lastName: true, address: true, city: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy
    })

    return successResponse(jobs)
  } catch (error) {
    return errorResponse('Failed to fetch jobs', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = jobSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    // Validate assigned user if provided
    if (result.data.assignedToUserId) {
      const assignedUser = await prisma.user.findFirst({
        where: {
          id: result.data.assignedToUserId,
          companyId,
          role: 'tech',
        },
      })

      if (!assignedUser) {
        return errorResponse('Assigned user must be a worker (tech) in the same company', 400)
      }
    }

    // Fetch customer address if not provided
    let addressData = {
      address: result.data.address,
      city: result.data.city,
      state: result.data.state,
      zip: result.data.zip,
    }

    if (!addressData.address) {
      const customer = await prisma.customer.findUnique({
        where: { id: result.data.customerId }
      })
      if (customer) {
        addressData = {
          address: customer.address ?? undefined,
          city: customer.city ?? undefined,
          state: customer.state ?? undefined,
          zip: customer.zip ?? undefined,
        }
      }
    }

    const job = await prisma.job.create({
      data: {
        ...result.data,
        ...addressData,
        companyId,
      },
    })

    return successResponse(job, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create job', 500)
  }
}

