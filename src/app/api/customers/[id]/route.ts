import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { customerSchema } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const customer = await prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        jobs: { orderBy: { createdAt: 'desc' }, take: 5 },
        estimates: { orderBy: { createdAt: 'desc' }, take: 5 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (!customer) {
      return errorResponse('Customer not found', 404)
    }

    return successResponse(customer)
  } catch (error) {
    return errorResponse('Failed to fetch customer', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params
    const body = await req.json()

    // Ensure customer belongs to company
    const existingCustomer = await prisma.customer.findFirst({
      where: { id, companyId },
    })

    if (!existingCustomer) {
      return errorResponse('Customer not found', 404)
    }

    const result = customerSchema.partial().safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: result.data,
    })

    return successResponse(customer)
  } catch (error) {
    return errorResponse('Failed to update customer', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    // Ensure customer belongs to company
    const existingCustomer = await prisma.customer.findFirst({
      where: { id, companyId },
    })

    if (!existingCustomer) {
      return errorResponse('Customer not found', 404)
    }

    // Optional: Check if customer has related data before deleting
    // For MVP, we might just let foreign keys handle it or restrict deletion

    await prisma.customer.delete({
      where: { id },
    })

    return successResponse({ message: 'Customer deleted' })
  } catch (error) {
    return errorResponse('Failed to delete customer', 500)
  }
}



