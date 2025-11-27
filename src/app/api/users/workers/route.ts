import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()

    const workers = await prisma.user.findMany({
      where: {
        companyId,
        role: 'tech',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return successResponse(workers)
  } catch (error) {
    return errorResponse('Failed to fetch workers', 500)
  }
}



