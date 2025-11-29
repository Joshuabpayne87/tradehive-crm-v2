import { NextRequest } from 'next/server'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { getGoogleAuthUrl } from '@/lib/gmail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/auth/google/connect
 * Returns the Google OAuth URL for the company to authorize
 */
export async function GET(req: NextRequest) {
    try {
        await getCompanyId() // Verify user is authenticated

        const authUrl = getGoogleAuthUrl()

        return successResponse({ authUrl })
    } catch (error) {
        console.error('Error generating Google auth URL:', error)
        return errorResponse('Failed to generate authorization URL', 500)
    }
}
