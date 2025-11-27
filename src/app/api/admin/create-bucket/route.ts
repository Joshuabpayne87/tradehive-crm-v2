import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { errorResponse, successResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse('Missing Supabase environment variables', 500)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return errorResponse(`Failed to list buckets: ${listError.message}`, 500)
    }

    const existingBucket = buckets?.find(b => b.name === 'attachments')
    if (existingBucket) {
      return successResponse({
        message: 'Bucket already exists',
        bucket: existingBucket,
      })
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('attachments', {
      public: false, // Private bucket
      fileSizeLimit: 10485760, // 10MB in bytes
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    })

    if (error) {
      console.error('Error creating bucket:', error)
      return errorResponse(`Failed to create bucket: ${error.message}`, 500)
    }

    return successResponse({
      message: 'Bucket created successfully',
      bucket: data,
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return errorResponse(`Unexpected error: ${error.message}`, 500)
  }
}

