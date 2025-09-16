/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // or true if you want to skip linting
  },
};

export default nextConfig;
