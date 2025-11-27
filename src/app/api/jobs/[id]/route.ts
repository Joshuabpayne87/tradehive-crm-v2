import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { jobSchema } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const job = await prisma.job.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        invoices: true,
        attachments: true,
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    return successResponse(job)
  } catch (error) {
    return errorResponse('Failed to fetch job', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params
    const body = await req.json()

    const existingJob = await prisma.job.findFirst({
      where: { id, companyId },
    })

    if (!existingJob) {
      return errorResponse('Job not found', 404)
    }

    const result = jobSchema.partial().safeParse(body)
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

    const job = await prisma.job.update({
      where: { id },
      data: result.data,
    })

    return successResponse(job)
  } catch (error) {
    return errorResponse('Failed to update job', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const existingJob = await prisma.job.findFirst({
      where: { id, companyId },
    })

    if (!existingJob) {
      return errorResponse('Job not found', 404)
    }

    await prisma.job.delete({
      where: { id },
    })

    return successResponse({ message: 'Job deleted' })
  } catch (error) {
    return errorResponse('Failed to delete job', 500)
  }
}

