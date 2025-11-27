/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Only needed for Docker/production - disabled for dev
  // This makes all API routes dynamic, preventing static analysis issues during build
  experimental: {
    // Add any experimental features if needed
  },
};

export default nextConfig;
