import { NextRequest } from 'next/server'
import { deleteSession } from '@/lib/session'
import { errorResponse, successResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    await deleteSession()
    return successResponse({ message: 'Signed out successfully' })
  } catch (error: any) {
    console.error('Sign out error:', error)
    return errorResponse('Failed to sign out', 500)
  }
}

