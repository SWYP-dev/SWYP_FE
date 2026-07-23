import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swyp-prod-177989594187-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
