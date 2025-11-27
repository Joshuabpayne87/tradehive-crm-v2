import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    // Fetch the estimate
    const estimate = await prisma.estimate.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    if (!estimate) {
      return errorResponse('Estimate not found', 404)
    }

    // Check if invoice already exists for this estimate
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        estimateId: id,
        companyId,
      },
    })

    if (existingInvoice) {
      return errorResponse('Invoice already exists for this estimate', 400)
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)}`

    // Calculate due date (30 days from now, or use estimate validUntil if set)
    const dueDate = estimate.validUntil
      ? new Date(estimate.validUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Create invoice from estimate
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: estimate.customerId,
        companyId,
        estimateId: id, // Link back to original estimate
        subtotal: estimate.subtotal,
        tax: estimate.tax,
        taxRate: estimate.taxRate,
        total: estimate.total,
        amountPaid: 0,
        status: 'draft',
        dueDate,
        notes: estimate.notes,
        lineItems: {
          create: estimate.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            type: item.type,
          })),
        },
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    // Optionally update estimate status to 'approved'
    await prisma.estimate.update({
      where: { id },
      data: { status: 'approved' },
    })

    return successResponse(invoice, 201)
  } catch (error) {
    console.error('Conversion error:', error)
    return errorResponse('Failed to convert estimate to invoice', 500)
  }
}


