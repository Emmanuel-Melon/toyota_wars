/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@toyota/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
