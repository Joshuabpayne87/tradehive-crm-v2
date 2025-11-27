import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkerUser, errorResponse, successResponse } from '@/lib/worker-auth'

export async function GET(req: NextRequest) {
  try {
    const worker = await getWorkerUser()

    const jobs = await prisma.job.findMany({
      where: {
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
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    })

    return successResponse(jobs)
  } catch (error: any) {
    if (error.message.includes('Access denied')) {
      return errorResponse(error.message, 403)
    }
    return errorResponse('Failed to fetch schedule', 500)
  }
}



