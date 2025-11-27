import { getAuthenticatedUser, getCompanyId as getCompanyIdFromAuth } from './auth'
import { NextResponse } from 'next/server'

/**
 * Get the current authenticated user
 */
export async function getAuthenticatedSession() {
  const user = await getAuthenticatedUser()
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role,
    },
  }
}

/**
 * Get the company ID from the authenticated user
 */
export async function getCompanyId() {
  return getCompanyIdFromAuth()
}

/**
 * Create an error response
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Create a success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Ensure all queries are scoped to the user's company
 */
export async function withCompanyScope<T>(
  callback: (companyId: string) => Promise<T>
): Promise<T> {
  const companyId = await getCompanyId()
  return callback(companyId)
}

