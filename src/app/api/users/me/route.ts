import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return errorResponse('Failed to fetch user', 500)
  }
}



