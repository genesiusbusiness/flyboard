/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour la production
  poweredByHeader: false,
  compress: true,
  // Images (Vercel optimise automatiquement)
  images: {
    domains: ['yxkbvhymsvasknslhpsa.supabase.co'],
  },
  // Trailing slash
  trailingSlash: false,
}

module.exports = nextConfig

