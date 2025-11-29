import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { estimateSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const estimate = await prisma.estimate.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        lineItems: true,
        attachments: true
      }
    })

    if (!estimate) {
      return errorResponse('Estimate not found', 404)
    }

    return successResponse(estimate)
  } catch (error) {
    return errorResponse('Failed to fetch estimate', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params
    const body = await req.json()

    const existingEstimate = await prisma.estimate.findFirst({
      where: { id, companyId },
    })

    if (!existingEstimate) {
      return errorResponse('Estimate not found', 404)
    }

    const result = estimateSchema.partial().safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    // Handle line items update if present
    // Standard Prisma way is to delete all and recreate, or update individually
    // For MVP, if lineItems are provided, we'll delete existing and recreate

    if (result.data.lineItems) {
      await prisma.estimateLineItem.deleteMany({
        where: { estimateId: id }
      })

      await prisma.estimate.update({
        where: { id },
        data: {
          ...result.data,
          lineItems: {
            create: result.data.lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.quantity * item.rate,
              type: item.type
            }))
          }
        }
      })
    } else {
      // Just update fields (exclude lineItems as they're handled separately)
      const { lineItems, ...updateData } = result.data
      await prisma.estimate.update({
        where: { id },
        data: updateData
      })
    }

    const updatedEstimate = await prisma.estimate.findUnique({
      where: { id },
      include: { lineItems: true }
    })

    return successResponse(updatedEstimate)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to update estimate', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const existingEstimate = await prisma.estimate.findFirst({
      where: { id, companyId },
    })

    if (!existingEstimate) {
      return errorResponse('Estimate not found', 404)
    }

    // Delete line items first (cascade should handle this, but being explicit)
    await prisma.estimateLineItem.deleteMany({
      where: { estimateId: id }
    })

    await prisma.estimate.delete({
      where: { id },
    })

    return successResponse({ message: 'Estimate deleted' })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to delete estimate', 500)
  }
}


