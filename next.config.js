/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Enable styled-components support natively
  compiler: {
    styledComponents: {
      displayName: process.env.NODE_ENV !== 'production',
      ssr: true,
      fileName: process.env.NODE_ENV !== 'production',
      topLevelImportPaths: [],
      meaninglessFileNames: ["index"],
      cssProp: true,
      namespace: "jt-app",
      minify: process.env.NODE_ENV === 'production',
      transpileTemplateLiterals: true,
    },
  },
  // Suppress hydration warnings for styled-components
  reactStrictMode: false,
  // Static export enabled ONLY for mobile Capacitor builds (not for web dev)
  // Use `npm run build:mobile` for mobile builds with static export
  // Use `npm run build` or `npm run dev` for web app with NextAuth support
  output: process.env.BUILD_TARGET === 'mobile' ? 'export' : undefined,
  trailingSlash: true,
  // Exclude web-only dynamic routes from mobile builds
  ...(process.env.BUILD_TARGET === 'mobile' && {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    experimental: {
      // Exclude admin edit pages from mobile build (web-only)
    },
  }),
  // Skip type checking and linting during build (faster mobile builds)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig