# Quick Start Guide - Run TradeHive Locally

## Step 1: Create Environment File

Create a file named `.env.local` in the `tradehive-crm` folder with this content:

```bash
# Database - UPDATE THIS with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/tradehive_crm?schema=public"

# NextAuth
NEXTAUTH_SECRET="jAF7AefaxgZP6febAND38c3ZcB3dntG/7U+krPALIFk="
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: Replace the `DATABASE_URL` with your actual PostgreSQL connection string.

### Database Options:

**Option A: Local PostgreSQL**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/tradehive_crm?schema=public"
```

**Option B: Supabase (Free)**
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings > Database
4. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

**Option C: Neon (Free)**
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard

## Step 2: Set Up Database

```bash
# Navigate to project folder
cd tradehive-crm

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

## Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Step 4: Create Your First Account

1. Go to `http://localhost:3000/signup` (or we need to create this page)
2. Create a company account
3. Start using the CRM!

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running (if using local)
- Check your DATABASE_URL is correct
- Verify network access (for cloud databases)

### "NEXTAUTH_SECRET is missing"
- Make sure `.env.local` exists in the `tradehive-crm` folder
- Restart the dev server after creating the file

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then `npm install`

## Optional: Add Stripe (for payments)

Add to `.env.local`:
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

Get test keys from: https://dashboard.stripe.com/test/apikeys

## Optional: Add Email (for notifications)

Add to `.env.local`:
```bash
SENDGRID_API_KEY="SG..."
```

Or use SMTP:
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-key"
```

Without email configured, notifications will log to the console in development mode.



