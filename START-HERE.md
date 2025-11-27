# 🚀 Start Here - Get TradeHive Running Locally

## Quick Setup (5 minutes)

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the `tradehive-crm` folder and paste this:

```bash
# Database - YOU MUST UPDATE THIS!
# Get a free database from Supabase or Neon (see below)
DATABASE_URL="postgresql://user:password@localhost:5432/tradehive_crm?schema=public"

# NextAuth (already generated for you)
NEXTAUTH_SECRET="jAF7AefaxgZP6febAND38c3ZcB3dntG/7U+krPALIFk="
NEXTAUTH_URL="http://localhost:3000"
```

### Step 2: Get a Database (Choose One)

**Option A: Supabase (Recommended - Free)**
1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new project
4. Go to Settings > Database
5. Copy the "Connection string" (URI format)
6. Replace `DATABASE_URL` in `.env.local`

**Option B: Neon (Free)**
1. Go to https://neon.tech
2. Sign up and create a project
3. Copy the connection string from dashboard
4. Replace `DATABASE_URL` in `.env.local`

**Option C: Local PostgreSQL**
```bash
# If you have PostgreSQL installed locally
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tradehive_crm?schema=public"
```

### Step 3: Run Setup Commands

Open terminal in the `tradehive-crm` folder and run:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### Step 4: Start the Server

```bash
npm run dev
```

### Step 5: Create Your Account

1. Open http://localhost:3000
2. Click "Sign up"
3. Enter:
   - Company Name
   - Your Name
   - Email
   - Password (min 6 characters)
4. You'll be automatically logged in!

## ✅ You're Ready!

Now you can:
- Add customers
- Create estimates
- Send invoices
- Schedule jobs
- View your dashboard

## Troubleshooting

**"Can't reach database server"**
- Double-check your DATABASE_URL
- Make sure the database is running (for local) or accessible (for cloud)

**"NEXTAUTH_SECRET is missing"**
- Make sure `.env.local` exists in `tradehive-crm` folder
- Restart the dev server: `npm run dev`

**"Module not found"**
- Run: `npm install`
- Delete `node_modules` and run `npm install` again

## Need Help?

Check `QUICK-START.md` for more detailed instructions.



