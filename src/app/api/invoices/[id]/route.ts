import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { invoiceSchema } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        lineItems: true,
        payments: true,
        attachments: true
      }
    })

    if (!invoice) {
      return errorResponse('Invoice not found', 404)
    }

    return successResponse(invoice)
  } catch (error) {
    return errorResponse('Failed to fetch invoice', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params
    const body = await req.json()

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, companyId },
    })

    if (!existingInvoice) {
      return errorResponse('Invoice not found', 404)
    }

    const result = invoiceSchema.partial().safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    if (result.data.lineItems) {
      await prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: id }
      })

      await prisma.invoice.update({
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
      await prisma.invoice.update({
        where: { id },
        data: updateData
      })
    }

    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true }
    })

    return successResponse(updatedInvoice)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to update invoice', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, companyId },
    })

    if (!existingInvoice) {
      return errorResponse('Invoice not found', 404)
    }

    // Delete line items first
    await prisma.invoiceLineItem.deleteMany({
      where: { invoiceId: id }
    })

    // Delete payments if they exist
    await prisma.payment.deleteMany({
      where: { invoiceId: id }
    })

    await prisma.invoice.delete({
      where: { id },
    })

    return successResponse({ message: 'Invoice deleted' })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to delete invoice', 500)
  }
}


