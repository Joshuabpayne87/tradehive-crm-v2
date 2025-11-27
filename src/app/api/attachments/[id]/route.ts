import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const companyId = await getCompanyId()
    const { id } = await params

    const attachment = await prisma.attachment.findFirst({
      where: { id, companyId }
    })

    if (!attachment) {
      return errorResponse('Attachment not found', 404)
    }

    // Delete from Supabase Storage
    const supabase = await createClient()
    // Extract file path from URL
    // Supabase public URL format: https://[project].supabase.co/storage/v1/object/public/attachments/uploads/...
    const urlParts = attachment.fileUrl.split('/')
    const pathIndex = urlParts.indexOf('attachments')
    if (pathIndex !== -1) {
      const filePath = urlParts.slice(pathIndex + 1).join('/')
      const { error: deleteError } = await supabase.storage
        .from('attachments')
        .remove([filePath])

      if (deleteError) {
        console.error('Supabase delete error:', deleteError)
        // Continue with database deletion even if storage delete fails
      }
    }

    await prisma.attachment.delete({
      where: { id }
    })

    return successResponse({ message: 'Attachment deleted' })
  } catch (error) {
    console.error('Delete error:', error)
    return errorResponse('Failed to delete attachment', 500)
  }
}

