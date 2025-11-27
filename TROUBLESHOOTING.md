# Troubleshooting Guide

## "localhost refused to connect"

### Solution 1: Check if server is running
```bash
# In the tradehive-crm folder, run:
npm run dev
```

Wait 10-20 seconds for the server to start. You should see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

### Solution 2: Check if port 3000 is in use
If port 3000 is busy, Next.js will try 3001, 3002, etc. Check the terminal output for the actual URL.

### Solution 3: Database Connection Issues

If you see database errors, you need to:

1. **Get a real database URL**:
   - **Supabase** (Free): https://supabase.com → Create project → Settings → Database → Copy connection string
   - **Neon** (Free): https://neon.tech → Create project → Copy connection string

2. **Update `.env.local`**:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

### Solution 4: Prisma Client Issues

If you see "Cannot find module '@prisma/client'", run:
```bash
npx prisma generate
```

### Solution 5: Clear Cache and Restart

```bash
# Delete build cache
rm -rf .next
# Or on Windows:
Remove-Item -Recurse -Force .next

# Restart server
npm run dev
```

## Common Errors

### "Missing required environment variable: DATABASE_URL"
- Make sure `.env.local` exists in the `tradehive-crm` folder
- Restart the dev server after creating/updating `.env.local`

### "Can't reach database server"
- Check your DATABASE_URL is correct
- For cloud databases, make sure your IP is allowed (Supabase/Neon have IP allowlists)
- For local PostgreSQL, make sure the service is running

### "Module not found"
```bash
npm install
```

### Port already in use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm run dev
```

## Still Having Issues?

1. Check the terminal output for specific error messages
2. Make sure Node.js version is 18+ (`node --version`)
3. Try deleting `node_modules` and reinstalling:
   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install
   ```



