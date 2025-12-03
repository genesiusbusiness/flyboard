/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour la production
  poweredByHeader: false,
  compress: true,
  // Optimisations
  swcMinify: true,
  // Output export pour S3 statique (désactivé temporairement)
  // output: 'export',
  // Images
  images: {
    unoptimized: true, // Pour S3 statique
  },
  // Trailing slash pour S3
  trailingSlash: false,
  // Configuration pour les routes dynamiques avec export statique
  // Note: Les routes dynamiques nécessitent generateStaticParams dans chaque segment
  // Pour S3 statique, nous utilisons le routing côté client uniquement
}

module.exports = nextConfig

