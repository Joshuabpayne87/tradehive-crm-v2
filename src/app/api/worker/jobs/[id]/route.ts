import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkerUser, errorResponse, successResponse } from '@/lib/worker-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const worker = await getWorkerUser()
    const { id } = await params

    const job = await prisma.job.findFirst({
      where: {
        id,
        assignedToUserId: worker.id,
        companyId: worker.companyId,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zip: true,
          }
        }
      }
    })

    if (!job) {
      return errorResponse('Job not found or not assigned to you', 404)
    }

    return successResponse(job)
  } catch (error: any) {
    if (error.message.includes('Access denied')) {
      return errorResponse(error.message, 403)
    }
    return errorResponse('Failed to fetch job', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const worker = await getWorkerUser()
    const { id } = await params
    const body = await req.json()

    // Verify job is assigned to this worker
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        assignedToUserId: worker.id,
        companyId: worker.companyId,
      },
    })

    if (!existingJob) {
      return errorResponse('Job not found or not assigned to you', 404)
    }

    // Only allow status updates and completedAt
    const allowedFields = ['status', 'completedAt']
    const updateData: any = {}

    if (body.status && ['scheduled', 'in_progress', 'completed', 'cancelled'].includes(body.status)) {
      updateData.status = body.status
      
      // Auto-set completedAt when status changes to completed
      if (body.status === 'completed' && !existingJob.completedAt) {
        updateData.completedAt = new Date()
      }
    }

    if (body.completedAt) {
      updateData.completedAt = new Date(body.completedAt)
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zip: true,
          }
        }
      }
    })

    return successResponse(job)
  } catch (error: any) {
    if (error.message.includes('Access denied')) {
      return errorResponse(error.message, 403)
    }
    return errorResponse('Failed to update job', 500)
  }
}



