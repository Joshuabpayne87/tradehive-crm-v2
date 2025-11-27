# Quick Setup - After Getting Neon Connection String

## Step 1: Get Your Connection String

After completing `neonctl init`, you'll get a connection string that looks like:
```
postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**OR** get it from Neon Dashboard:
1. Go to https://console.neon.tech
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string

## Step 2: Update .env.local

**Option A: Manual**
1. Open `tradehive-crm/.env.local`
2. Replace the `DATABASE_URL` line with your Neon connection string
3. Save the file

**Option B: Using PowerShell Script**
```powershell
cd tradehive-crm
.\update-database.ps1 -ConnectionString "postgresql://user:pass@ep-xxxxx.neon.tech/neondb?sslmode=require"
```

## Step 3: Run Migrations

```bash
cd tradehive-crm
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Set up the schema
- Generate Prisma Client

## Step 4: Start the Server

```bash
npm run dev
```

## Step 5: Visit the App

Open http://localhost:3000 and click "Sign up" to create your account!

---

## If You Get Errors

**"Can't reach database server"**
- Make sure your connection string includes `?sslmode=require` at the end
- Check that your Neon project is active

**"Migration failed"**
- Make sure the database is empty (or use `--force` to reset)
- Check your connection string is correct

**"Module not found"**
```bash
npm install
npx prisma generate
```



