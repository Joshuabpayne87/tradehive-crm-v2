import { getSession } from './session'
import { prisma } from './prisma'

/**
 * Get the current authenticated user from session
 * Uses cookie-based session management
 */
export async function getAuthenticatedUser(request?: Request) {
  try {
    // Get session from cookie
    const session = await getSession()

    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        companyId: session.user.companyId,
        role: session.user.role,
      }
    }

    // Fallback removed for production security
    // const dbUser = await prisma.user.findFirst({
    //   include: { company: true },
    // })

    // if (dbUser) {
    //   return {
    //     id: dbUser.id,
    //     email: dbUser.email,
    //     name: dbUser.name,
    //     companyId: dbUser.companyId,
    //     role: dbUser.role,
    //   }
    // }

    throw new Error('No authenticated user found')
  } catch (error) {
    console.error('Authentication error:', error)
    throw new Error('Unauthorized')
  }
}

/**
 * Get the company ID from the authenticated user
 */
export async function getCompanyId() {
  const user = await getAuthenticatedUser()
  return user.companyId
}
