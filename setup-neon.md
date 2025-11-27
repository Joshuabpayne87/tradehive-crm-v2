# Neon Database Setup

## Option 1: Using Neon CLI (Current)

The `neonctl init` command is running. Follow these steps:

1. **Select Editor** (or press Enter to skip)
2. **Authenticate** - It will open a browser to log in to Neon
3. **Create Project** - Follow prompts to create a new database
4. **Get Connection String** - It will provide a DATABASE_URL

After you get the connection string, update `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

Then run:
```bash
npx prisma migrate dev --name init
npm run dev
```

## Option 2: Manual Setup (Alternative)

If the CLI doesn't work, do this:

1. Go to https://neon.tech
2. Sign up / Log in
3. Click "Create Project"
4. Name it "tradehive-crm"
5. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. Update `.env.local` with this connection string
7. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
8. Start server:
   ```bash
   npm run dev
   ```

## After Setup

Once you have the DATABASE_URL in `.env.local`, run:

```bash
# Generate Prisma Client (if not done)
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Start the server
npm run dev
```

Then visit http://localhost:3000 and sign up!



