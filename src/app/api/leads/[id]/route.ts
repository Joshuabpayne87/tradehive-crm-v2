import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { leadSchema } from '@/lib/validations-leads'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const lead = await prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!lead) {
      return errorResponse('Lead not found', 404)
    }

    return successResponse(lead)
  } catch (error) {
    return errorResponse('Failed to fetch lead', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params
    const body = await req.json()

    const existingLead = await prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!existingLead) {
      return errorResponse('Lead not found', 404)
    }

    const result = leadSchema.partial().safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: result.data,
    })

    return successResponse(lead)
  } catch (error) {
    return errorResponse('Failed to update lead', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const existingLead = await prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!existingLead) {
      return errorResponse('Lead not found', 404)
    }

    await prisma.lead.delete({
      where: { id },
    })

    return successResponse({ message: 'Lead deleted' })
  } catch (error) {
    return errorResponse('Failed to delete lead', 500)
  }
}



