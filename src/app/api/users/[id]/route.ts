import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getAuthenticatedUser()
    const companyId = await getCompanyId()
    const { id } = await params

    // Only owners and admins can delete users
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return errorResponse('Unauthorized: Only owners and admins can delete users', 403)
    }

    // Cannot delete yourself
    if (id === currentUser.id) {
      return errorResponse('Cannot delete your own account', 400)
    }

    // Find user to delete
    const userToDelete = await prisma.user.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!userToDelete) {
      return errorResponse('User not found', 404)
    }

    // Cannot delete the owner
    if (userToDelete.role === 'owner') {
      return errorResponse('Cannot delete the company owner', 400)
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    return successResponse({ message: 'User deleted successfully' })
  } catch (error) {
    return errorResponse('Failed to delete user', 500)
  }
}

