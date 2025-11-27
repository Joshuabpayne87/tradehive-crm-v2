import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // In a real app, we should verify the portal session cookie here
    // For MVP, we trust the endpoint is called from the verified portal page
    
    const { id } = await params
    const { action, signature } = await req.json() // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse('Invalid action', 400)
    }

    const status = action === 'approve' ? 'approved' : 'rejected'
    
    // Update Estimate
    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        status,
        [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date(),
        // We could store signature if we added a field for it
      }
    })

    // If approved, optionally convert to Job or Invoice automatically?
    // For now, just update status.

    return successResponse(estimate)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to update estimate', 500)
  }
}



