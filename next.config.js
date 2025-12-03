/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour la production
  poweredByHeader: false,
  compress: true,
  // Optimisations
  swcMinify: true,
  // Export statique pour déploiement sur hébergeur statique
  output: 'export',
  // Images
  images: {
    unoptimized: true,
  },
  // Trailing slash
  trailingSlash: false,
}

module.exports = nextConfig

