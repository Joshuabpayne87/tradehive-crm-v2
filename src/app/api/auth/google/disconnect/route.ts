import { NextRequest } from 'next/server'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { disconnectGmail } from '@/lib/gmail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/auth/google/disconnect
 * Disconnects Gmail for the company
 */
export async function POST(req: NextRequest) {
    try {
        const companyId = await getCompanyId()

        await disconnectGmail(companyId)

        return successResponse({ message: 'Gmail disconnected successfully' })
    } catch (error) {
        console.error('Error disconnecting Gmail:', error)
        return errorResponse('Failed to disconnect Gmail', 500)
    }
}
