import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import * as z from 'zod'

const recurringInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  template: z.object({
    lineItems: z.array(z.object({
      description: z.string(),
      quantity: z.number(),
      rate: z.number(),
      type: z.string(),
    })),
    notes: z.string().optional(),
    taxRate: z.number().optional(),
  })
})

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    
    const recurringInvoices = await prisma.recurringInvoice.findMany({
      where: { companyId },
      include: {
        customer: {
          select: { firstName: true, lastName: true }
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, invoiceNumber: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(recurringInvoices)
  } catch (error) {
    return errorResponse('Failed to fetch recurring invoices', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = recurringInvoiceSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    const { startDate } = result.data
    // nextRunDate is initially startDate
    const nextRunDate = startDate

    const recurringInvoice = await prisma.recurringInvoice.create({
      data: {
        companyId,
        customerId: result.data.customerId,
        frequency: result.data.frequency,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        nextRunDate,
        template: result.data.template as any, // Cast to any for Prisma Json
        isActive: true,
      }
    })

    return successResponse(recurringInvoice, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create recurring invoice', 500)
  }
}

