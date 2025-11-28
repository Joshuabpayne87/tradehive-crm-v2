/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  // output: 'standalone', // Only needed for Docker/production - disabled for dev
  // This makes all API routes dynamic, preventing static analysis issues during build

};

export default nextConfig;
