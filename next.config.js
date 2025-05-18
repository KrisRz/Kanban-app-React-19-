/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'randomuser.me',
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'ui-avatars.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  typescript: {
    // Skip type checking during build if SKIP_TYPESCRIPT is set
    ignoreBuildErrors: process.env.SKIP_TYPESCRIPT === 'true'
  },
  eslint: {
    // Skip ESLint checking during build if SKIP_ESLINT is set
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
