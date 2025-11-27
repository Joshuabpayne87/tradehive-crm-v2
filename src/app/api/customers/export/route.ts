import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse } from '@/lib/api-helpers'
import { generateCsv } from '@/lib/export/csv-export'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const sort = searchParams.get('sort')
    
    const whereClause: any = { companyId }
    
    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'name_asc') orderBy = { firstName: 'asc' }
    else if (sort === 'name_desc') orderBy = { firstName: 'desc' }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy,
      include: {
        _count: {
          select: { jobs: true, estimates: true, invoices: true }
        }
      }
    })

    const csv = generateCsv(customers, [
      { header: 'First Name', key: 'firstName' },
      { header: 'Last Name', key: 'lastName' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'Jobs', key: '_count.jobs', formatter: (v) => String(v || 0) },
      { header: 'Created', key: 'createdAt', formatter: (v) => format(new Date(v), 'yyyy-MM-dd') },
    ])

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error) {
    return errorResponse('Failed to export customers', 500)
  }
}

