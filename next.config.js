/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production'
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signup',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/signup',
        permanent: false,
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    return config
  }
}

module.exports = nextConfig
