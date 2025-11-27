/**
 * Script to create the 'attachments' storage bucket in Supabase
 * Run with: npx tsx scripts/create-storage-bucket.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createBucket() {
  console.log('Creating storage bucket "attachments"...')

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      process.exit(1)
    }

    const existingBucket = buckets?.find(b => b.name === 'attachments')
    if (existingBucket) {
      console.log('✓ Bucket "attachments" already exists!')
      console.log('  ID:', existingBucket.id)
      console.log('  Public:', existingBucket.public)
      return
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
      process.exit(1)
    }

    console.log('✓ Bucket "attachments" created successfully!')
    console.log('  ID:', data.id)
    console.log('  Name:', data.name)
    console.log('  Public:', data.public)
  } catch (error: any) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createBucket()

