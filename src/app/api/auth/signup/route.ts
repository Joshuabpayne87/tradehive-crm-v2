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
  try {
    const body = await req.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return errorResponse(result.error.issues[0].message, 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 10)

    // Create Company and User in our database
    const { company, user } = await prisma.$transaction(async (tx) => {
      // Create Company
      const company = await tx.company.create({
        data: {
          name: result.data.companyName,
          email: result.data.email,
        }
      })

      // Create User with hashed password
      const user = await tx.user.create({
        data: {
          email: result.data.email,
          name: result.data.name,
          password: hashedPassword,
          role: 'owner',
          companyId: company.id,
        }
      })

      return { company, user }
    })

    // Create session for the new user
    await createSession(user.id)

    return successResponse({
      message: 'Account created successfully',
      userId: user.id,
      companyId: company.id
    }, 201)
  } catch (error: any) {
    console.error('Signup error:', error)
    return errorResponse(error.message || 'Failed to create account', 500)
  }
}

