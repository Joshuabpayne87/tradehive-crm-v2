# Deploying Trade Hive CRM to Vercel

This guide outlines the steps to deploy the Trade Hive CRM application to Vercel.

## Prerequisites

1.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
2.  **Source Code**: The code should be pushed to a Git repository (GitHub, GitLab, or Bitbucket).
3.  **Database**: A running Supabase instance (or compatible PostgreSQL database).
4.  **Stripe Account**: For payments.
5.  **Stack Auth**: For authentication.

## 1. Environment Variables

You must configure the following Environment Variables in your Vercel Project Settings.

### Core
-   `NEXTAUTH_URL`: The canonical URL of your site (e.g., `https://your-project.vercel.app`).
-   `NEXTAUTH_SECRET`: A random string used to hash tokens. You can generate one with `openssl rand -base64 32`.
-   `NEXT_PUBLIC_APP_URL`: Same as `NEXTAUTH_URL`.

### Database (Supabase)
-   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
-   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for admin tasks).
-   `DATABASE_URL`: The connection string for your PostgreSQL database (Transaction Mode).
-   `DIRECT_URL`: The connection string for your PostgreSQL database (Session Mode).

### Authentication (Stack Auth)
-   `NEXT_PUBLIC_STACK_PROJECT_ID`: Stack Project ID.
-   `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`: Stack Publishable Client Key.
-   `STACK_SECRET_SERVER_KEY`: Stack Secret Server Key.

### Payments (Stripe)
-   `STRIPE_SECRET_KEY`: Your Stripe Secret Key.
-   `STRIPE_WEBHOOK_SECRET`: Your Stripe Webhook Secret (for `api/webhooks/stripe`).

### Email (SMTP/SendGrid)
-   `SMTP_HOST`: e.g., `smtp.sendgrid.net`.
-   `SMTP_PORT`: e.g., `587`.
-   `SMTP_SECURE`: `true` or `false`.
-   `SMTP_USER`: SMTP Username.
-   `SMTP_PASS`: SMTP Password.
-   `SMTP_FROM`: Email address to send from (e.g., `"TradeHive" <noreply@yourdomain.com>`).
-   `SENDGRID_API_KEY`: (Optional) If using SendGrid directly.

## 2. Deployment Steps

### Option A: Deploy via Vercel Dashboard (Recommended)

1.  Log in to Vercel.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your Git repository.
4.  In the **"Configure Project"** step:
    -   **Framework Preset**: Next.js (should be auto-detected).
    -   **Root Directory**: `./` (default).
    -   **Build Command**: `next build` (default).
    -   **Output Directory**: `.next` (default).
    -   **Install Command**: `npm install` (default).
5.  Expand **"Environment Variables"** and add all the variables listed above.
6.  Click **"Deploy"**.

### Option B: Deploy via Vercel CLI

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel login`.
3.  Run `vercel` in the project root.
4.  Follow the prompts to link the project.
5.  Set up environment variables via the dashboard or CLI (`vercel env add`).
6.  Run `vercel --prod` to deploy.

## 3. Post-Deployment

1.  **Database Migration**: The `postinstall` script (`prisma generate`) runs automatically. You may need to run migrations manually if not using a migration workflow.
    -   Ideally, run `npx prisma migrate deploy` from your local machine pointing to the production database, or add it to the build command (e.g., `prisma migrate deploy && next build`).
2.  **Webhooks**: Update your Stripe Webhook URL to point to your production URL: `https://your-project.vercel.app/api/webhooks/stripe`.
3.  **Auth Redirects**: Update your Stack Auth and NextAuth callback URLs if necessary.

## Troubleshooting

-   **Prisma Client Error**: If you see errors about Prisma Client not being initialized, ensure `prisma generate` ran during the build (we added this to `postinstall`).
-   **Database Connection**: Ensure your `DATABASE_URL` is correct and accessible from Vercel (allow all IPs or use Vercel integration).
