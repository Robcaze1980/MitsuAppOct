/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
  },
  images: {
    domains: ['localhost'], // Add 'localhost' to allow local images
  },
}

module.exports = nextConfig
