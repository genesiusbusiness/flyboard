/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour la production
  poweredByHeader: false,
  compress: true,
  // Optimisations
  swcMinify: true,
  // Output standalone pour AWS Amplify
  output: 'standalone',
  // Images
  images: {
    unoptimized: true,
  },
  // Trailing slash
  trailingSlash: false,
}

module.exports = nextConfig

