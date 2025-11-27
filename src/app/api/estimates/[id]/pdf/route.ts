import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, errorResponse } from '@/lib/api-helpers'
import { renderToBuffer } from '@react-pdf/renderer'
import { EstimatePDF } from '@/lib/pdf/estimate-pdf'
import React from 'react'

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
      },
    })

    if (!estimate) {
      return errorResponse('Estimate not found', 404)
    }

    // Generate PDF
    const pdfDoc = React.createElement(EstimatePDF, { estimate }) as any
    const pdfBuffer = await renderToBuffer(pdfDoc)

    return new Response(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimate-${estimate.estimateNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return errorResponse('Failed to generate PDF', 500)
  }
}


