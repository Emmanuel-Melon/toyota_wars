/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@toyota/client", "@toyota/ai", "@toyota/agents"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
