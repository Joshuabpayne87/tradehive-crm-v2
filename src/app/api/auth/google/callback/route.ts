import { NextRequest } from 'next/server'
import { getCompanyId, errorResponse } from '@/lib/api-helpers'
import { handleGoogleCallback } from '@/lib/gmail'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google
 */
export async function GET(req: NextRequest) {
    try {
        const companyId = await getCompanyId()
        const { searchParams } = new URL(req.url)
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
            return redirect('/settings?gmail_error=' + error)
        }

        if (!code) {
            return errorResponse('No authorization code provided', 400)
        }

        const result = await handleGoogleCallback(code, companyId)

        if (result.success) {
            return redirect('/settings?gmail_connected=true')
        } else {
            return redirect('/settings?gmail_error=connection_failed')
        }
    } catch (error) {
        console.error('Error in Google callback:', error)
        return redirect('/settings?gmail_error=server_error')
    }
}
