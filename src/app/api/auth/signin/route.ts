import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { errorResponse, successResponse } from '@/lib/api-helpers'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('Email and password are required', 400)
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    })

    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    // Check if user has a password set
    if (!user.password) {
      return errorResponse('Password not set for this account. Please contact support.', 401)
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401)
    }

    // Create session
    await createSession(user.id)

    return successResponse({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      }
    })
  } catch (error: any) {
    console.error('Sign in error:', error)
    return errorResponse(error.message || 'Invalid email or password', 401)
  }
}

