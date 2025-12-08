import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { errorResponse, successResponse } from '@/lib/api-helpers'
import * as z from 'zod'
import bcrypt from 'bcryptjs'

const signupSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export async function POST(req: NextRequest) {
  console.log('[Signup] Request received')
  try {
    const body = await req.json()
    console.log(`[Signup] Body parsed: ${JSON.stringify({ ...body, password: '***' })}`)

    const result = signupSchema.safeParse(body)

    if (!result.success) {
      console.error('[Signup] Validation failed:', JSON.stringify(result.error))
      return errorResponse(result.error.issues[0].message, 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email },
    })

    if (existingUser) {
      console.warn('[Signup] User already exists:', result.data.email)
      return errorResponse('User with this email already exists', 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 10)

    // Create Company and User in our database
    console.log('[Signup] Starting transaction')
    const { company, user } = await prisma.$transaction(async (tx: any) => {
      // Create Company
      console.log('[Signup] Creating company...')
      const company = await tx.company.create({
        data: {
          name: result.data.companyName,
          email: result.data.email,
        }
      })
      console.log('[Signup] Company created:', company.id)

      // Create User with hashed password
      console.log('[Signup] Creating user...')
      const user = await tx.user.create({
        data: {
          email: result.data.email,
          name: result.data.name,
          password: hashedPassword,
          role: 'owner',
          companyId: company.id,
        }
      })
      console.log('[Signup] User created:', user.id)

      return { company, user }
    })
    console.log(`[Signup] Transaction successful. User ID: ${user.id}`)

    // Create session for the new user
    console.log('[Signup] Creating session...')
    try {
      await createSession(user.id)
      console.log('[Signup] Session created successfully')
    } catch (sessionError: any) {
      console.error('[Signup] Session creation failed:', sessionError)
      // Don't fail the request if session creation fails, just log it? 
      // Or maybe we should fail? 
      // For now, let's rethrow to see the error, but we logged it.
      throw sessionError
    }

    return successResponse({
      message: 'Account created successfully',
      userId: user.id,
      companyId: company.id
    }, 201)
  } catch (error: any) {
    console.error('[Signup] Critical error:', error)
    // Log full stack trace
    if (error.stack) {
      console.error(error.stack)
    }
    return errorResponse(error.message || 'Failed to create account', 500)
  }
}
