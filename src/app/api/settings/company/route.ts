import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { companySettingsSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = companySettingsSchema.partial().safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: result.data,
    })

    return successResponse(company)
  } catch (error) {
    return errorResponse('Failed to update settings', 500)
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) return errorResponse('Company not found', 404)

    return successResponse(company)
  } catch (error) {
    return errorResponse('Failed to fetch settings', 500)
  }
}



