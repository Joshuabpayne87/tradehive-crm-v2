import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { invoiceSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sort = searchParams.get('sort')

    const whereClause: any = { companyId }

    if (status) whereClause.status = status
    if (customerId) whereClause.customerId = customerId
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'amount_desc') orderBy = { total: 'desc' }
    else if (sort === 'amount_asc') orderBy = { total: 'asc' }
    else if (sort === 'status') orderBy = { status: 'asc' }
    
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { firstName: true, lastName: true }
        },
        lineItems: true
      },
      orderBy
    })

    return successResponse(invoices)
  } catch (error) {
    return errorResponse('Failed to fetch invoices', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    const result = invoiceSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    // Generate invoice number if not provided
    const invoiceNumber = result.data.invoiceNumber || `INV-${Math.floor(Math.random() * 1000000)}`

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        ...result.data,
        invoiceNumber,
        companyId,
        lineItems: {
          create: result.data.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
            type: item.type
          }))
        }
      },
      include: {
        lineItems: true
      }
    })

    return successResponse(invoice, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create invoice', 500)
  }
}



