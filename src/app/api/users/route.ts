import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import * as z from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['tech', 'admin']).default('tech'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')

    const whereClause: any = { companyId }
    if (role) {
      whereClause.role = role
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse(users)
  } catch (error) {
    return errorResponse('Failed to fetch users', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser()
    
    // Only owners and admins can create users
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return errorResponse('Unauthorized: Only owners and admins can create users', 403)
    }

    const body = await req.json()
    const result = createUserSchema.safeParse(body)

    if (!result.success) {
      return errorResponse(result.error.message, 400)
    }

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email }
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 400)
    }

    // Create Supabase Auth user
    const supabase = await createClient()
    let authUser
    try {
      if (result.data.password) {
        // Create user with password
        const { data, error } = await supabase.auth.admin.createUser({
          email: result.data.email,
          password: result.data.password,
          user_metadata: {
            full_name: result.data.name,
          },
          email_confirm: true, // Auto-confirm email
        })
        if (error) throw error
        authUser = data.user
      } else {
        // Create user without password (they'll need to set it via invite)
        const { data, error } = await supabase.auth.admin.createUser({
          email: result.data.email,
          user_metadata: {
            full_name: result.data.name,
          },
          email_confirm: false, // They'll confirm via invite link
        })
        if (error) throw error
        authUser = data.user
        // TODO: Send invite email
      }
    } catch (error: any) {
      // Supabase might throw if user already exists
      if (error.message?.includes('already exists') || error.message?.includes('duplicate') || error.message?.includes('already registered')) {
        return errorResponse('User with this email already exists in authentication system', 400)
      }
      throw error
    }

    if (!authUser) {
      return errorResponse('Failed to create authentication user', 500)
    }

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        id: authUser.id, // Use Supabase auth user ID
        email: result.data.email,
        name: result.data.name,
        role: result.data.role,
        companyId: currentUser.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    // TODO: Send invite email if no password was provided
    // if (!result.data.password) {
    //   await sendInviteEmail(result.data.email, stackUser.id)
    // }

    return successResponse(user, 201)
  } catch (error: any) {
    console.error('Create user error:', error)
    return errorResponse(error.message || 'Failed to create user', 500)
  }
}

