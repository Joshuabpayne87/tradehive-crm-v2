import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse } from '@/lib/api-helpers'
import { generateCsv } from '@/lib/export/csv-export'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const sort = searchParams.get('sort')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const whereClause: any = { companyId }

    if (status) whereClause.status = status
    
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
        }
      },
      orderBy
    })

    const csv = generateCsv(invoices, [
      { header: 'Invoice #', key: 'invoiceNumber' },
      { header: 'Customer First Name', key: 'customer.firstName' },
      { header: 'Customer Last Name', key: 'customer.lastName' },
      { header: 'Status', key: 'status' },
      { header: 'Due Date', key: 'dueDate', formatter: (v) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
      { header: 'Total', key: 'total', formatter: (v) => `$${Number(v).toFixed(2)}` },
      { header: 'Amount Paid', key: 'amountPaid', formatter: (v) => `$${Number(v).toFixed(2)}` },
      { header: 'Date Issued', key: 'createdAt', formatter: (v) => format(new Date(v), 'yyyy-MM-dd') },
    ])

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="invoices-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error) {
    return errorResponse('Failed to export invoices', 500)
  }
}

