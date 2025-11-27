import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const lead = await prisma.lead.findFirst({
      where: { id, companyId },
    })

    if (!lead) {
      return errorResponse('Lead not found', 404)
    }

    // Create Customer from Lead
    const customer = await prisma.customer.create({
      data: {
        companyId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        notes: `Converted from Lead. Original notes: ${lead.notes || ''}`,
        tags: ['Converted Lead'],
      }
    })

    // Update Lead status to 'won'
    await prisma.lead.update({
      where: { id },
      data: { status: 'won' }
    })

    return successResponse({ customer, message: 'Lead converted successfully' })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to convert lead', 500)
  }
}



