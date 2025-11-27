# TradeHive CRM - Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tradehive_crm?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SendGrid or Resend)
# Option 1: SendGrid
SENDGRID_API_KEY="SG..."

# Option 2: Resend
RESEND_API_KEY="re_..."

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# File Storage (AWS S3 or Cloudflare R2)
# Option 1: AWS S3
AWS_S3_BUCKET="tradehive-uploads"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
```

## Database Setup

1. Set up a PostgreSQL database (Supabase, Neon, or local)
2. Update `DATABASE_URL` in `.env.local`
3. Run migrations:

```bash
npx prisma migrate dev --name init
```

4. Generate Prisma Client:

```bash
npx prisma generate
```

## Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## Development

```bash
npm run dev
```

## Project Structure

```
src/
  app/
    (auth)/          # Authentication routes
      login/
      signup/
    (dashboard)/      # Protected dashboard routes
      dashboard/
      customers/
      estimates/
      invoices/
      jobs/
      payments/
      leads/
      accounting/
      settings/
    api/              # API routes
      auth/
      customers/
      estimates/
      invoices/
      ...
  components/
    ui/               # shadcn/ui components
  lib/
    auth.ts           # NextAuth configuration
    prisma.ts         # Prisma client
    utils.ts          # Utility functions
  types/
    next-auth.d.ts    # NextAuth type definitions
```

## Next Steps

1. Complete authentication pages (login/signup)
2. Build customer management (EPIC 2)
3. Implement estimates system (EPIC 3)
4. Build invoicing (EPIC 4)
5. Integrate Stripe payments (EPIC 5)



