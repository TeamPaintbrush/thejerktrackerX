/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/thejerktrackerX',
  assetPrefix: '/thejerktrackerX',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig