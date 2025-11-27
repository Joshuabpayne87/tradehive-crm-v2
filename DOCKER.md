# Docker Setup Guide

This guide will help you run TradeHive CRM using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- Ports 3000 and 5432 available

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the `tradehive-crm` directory (or copy from `.env.example` if available):

```bash
# Required
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Optional (for full functionality)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Build and Start Services

```bash
cd tradehive-crm
docker-compose up --build
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Run the application on http://localhost:3000

### 3. Run Database Migrations

In a new terminal, run:

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma Client (if needed)
docker-compose exec app npx prisma generate
```

### 4. Access the Application

- **Application**: http://localhost:3000
- **Database**: localhost:5432
  - User: `tradehive`
  - Password: `tradehive_password`
  - Database: `tradehive_crm`

## Common Commands

### Start services (in background)
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes database)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Run commands in container
```bash
# Prisma commands
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma migrate dev

# Shell access
docker-compose exec app sh
```

### Rebuild after code changes
```bash
docker-compose up --build
```

## Production Considerations

For production deployment:

1. **Change default passwords** in `docker-compose.yml`
2. **Use strong NEXTAUTH_SECRET**
3. **Set up proper environment variables** for Stripe, email, etc.
4. **Use external database** (managed PostgreSQL service)
5. **Set up reverse proxy** (nginx/traefik) for HTTPS
6. **Configure backups** for PostgreSQL volume
7. **Use Docker secrets** for sensitive data

## Troubleshooting

### Port already in use
If port 3000 or 5432 is already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Database connection errors
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Verify DATABASE_URL in docker-compose.yml matches postgres service

### Build failures
- Clear Docker cache: `docker-compose build --no-cache`
- Check Node version compatibility
- Ensure all dependencies are in package.json

### Migration issues
- Ensure database is running: `docker-compose ps`
- Check Prisma schema is valid: `docker-compose exec app npx prisma validate`
- Reset database (⚠️ deletes data): `docker-compose exec app npx prisma migrate reset`

## Development Workflow

For active development, you may prefer to run Next.js locally and only use Docker for the database:

```bash
# Start only PostgreSQL
docker-compose up postgres -d

# Update .env.local with:
# DATABASE_URL="postgresql://tradehive:tradehive_password@localhost:5432/tradehive_crm?schema=public"

# Run Next.js locally
npm run dev
```


