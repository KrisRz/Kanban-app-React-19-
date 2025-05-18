/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
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
