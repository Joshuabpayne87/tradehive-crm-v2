import { getAuthenticatedUser } from './auth'
import { NextResponse } from 'next/server'

/**
 * Get the current authenticated user and verify they are a worker (role="tech")
 */
export async function getWorkerUser() {
  const user = await getAuthenticatedUser()
  
  if (user.role !== 'tech') {
    throw new Error('Access denied: Worker role required')
  }
  
  return user
}

/**
 * Require worker authentication - throws if user is not a worker
 */
export async function requireWorkerAuth() {
  return await getWorkerUser()
}

/**
 * Helper to create success responses
 */
export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Helper to create error responses
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}


