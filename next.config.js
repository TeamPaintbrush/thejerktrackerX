/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Only use basePath and assetPrefix for production builds
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/thejerktrackerX',
    assetPrefix: '/thejerktrackerX',
  }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig