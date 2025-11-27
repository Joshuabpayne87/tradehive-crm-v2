import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyId, errorResponse, successResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const formData = await req.formData()
    const file = formData.get('file') as File
    const entityId = formData.get('entityId') as string
    const entityType = formData.get('entityType') as string // 'estimate', 'invoice', 'job'

    if (!file) return errorResponse('No file provided', 400)

    const supabase = await createClient()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `uploads/${companyId}/${fileName}`

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return errorResponse('Failed to upload file to storage', 500)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath)

    const fileUrl = urlData.publicUrl

    // Save to database
    const attachmentData: any = {
      companyId,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
    }

    if (entityType === 'estimate') attachmentData.estimateId = entityId
    if (entityType === 'invoice') attachmentData.invoiceId = entityId
    if (entityType === 'job') attachmentData.jobId = entityId

    const attachment = await prisma.attachment.create({
      data: attachmentData
    })

    return successResponse(attachment)
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse('Failed to upload file', 500)
  }
}

