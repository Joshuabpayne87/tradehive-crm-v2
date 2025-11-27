# Supabase Migration Complete

This document outlines the migration from Stack Auth + Neon + AWS S3 to Supabase (Auth + Database + Storage).

## What Changed

### 1. Authentication
- **Before**: Stack Auth (`@stackframe/stack`)
- **After**: Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`)

### 2. Database
- **Before**: Neon PostgreSQL
- **After**: Supabase PostgreSQL (same Prisma schema)

### 3. File Storage
- **Before**: AWS S3 (`@aws-sdk/client-s3`)
- **After**: Supabase Storage

## Required Environment Variables

Add these to your `.env` file and Vercel project settings:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xzflkmlnofnurzjdmwlp:Railee2011%21Endthef3d%21@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://xzflkmlnofnurzjdmwlp.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Remove these (no longer needed):
# NEXT_PUBLIC_STACK_PROJECT_ID
# NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
# STACK_SECRET_SERVER_KEY
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_REGION
# AWS_S3_BUCKET
```

## Supabase Setup Steps

1. **Get your Supabase keys**:
   - Go to Supabase Dashboard → Project Settings → API
   - Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

2. **Create Storage Bucket**: ✅ **COMPLETE**
   - Bucket name: `attachments`
   - Public: `false` (private bucket)
   - File size limit: 10MB

3. **Set up Row Level Security (RLS)**:
   - The middleware handles authentication, but you may want to add RLS policies
   - For now, the app uses service role key for admin operations

## Database Schema

The Prisma schema remains the same. The database was reset and recreated using:
```bash
npx prisma db push
```

## Code Changes Summary

### New Files
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/middleware.ts` - Middleware session handler

### Updated Files
- `src/middleware.ts` - Now uses Supabase session handling
- `src/lib/auth.ts` - Uses Supabase Auth instead of Stack Auth
- `src/app/api/auth/signin/route.ts` - Supabase sign in
- `src/app/api/auth/signup/route.ts` - Supabase sign up
- `src/app/api/auth/signout/route.ts` - Supabase sign out
- `src/app/api/users/route.ts` - Uses Supabase admin API
- `src/app/api/attachments/upload/route.ts` - Uses Supabase Storage
- `src/app/api/attachments/[id]/route.ts` - Uses Supabase Storage delete
- `src/app/(dashboard)/settings/profile/page.tsx` - Uses Supabase client

### Removed Dependencies (to remove later)
- `@stackframe/stack` - Can be removed after testing
- `@aws-sdk/client-s3` - Can be removed after testing
- `@aws-sdk/s3-request-presigner` - Can be removed after testing

## Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Upload file attachment
- [ ] Delete file attachment
- [ ] Create user via admin panel
- [ ] Access protected routes (should redirect to login if not authenticated)

## Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is required for admin operations like creating users
- Make sure to set up RLS policies in Supabase if you want additional security
- ✅ Storage bucket `attachments` has been created
- All existing data was wiped during migration (as requested)

## ✅ Migration Status: COMPLETE

All components have been migrated:
- ✅ Database connected to Supabase
- ✅ Authentication migrated to Supabase Auth
- ✅ File storage migrated to Supabase Storage
- ✅ Storage bucket created
- ✅ All code updated

**Next Steps:**
1. Add Supabase API keys to your `.env` file (if not already done)
2. Test the application (see Testing Checklist above)
3. Deploy to Vercel with updated environment variables

