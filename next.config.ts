import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swyp-prod-177989594187-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com',
      },
      {
        // 피드 공고(job_feed) 썸네일이 로켓펀치 원본 이미지를 그대로 가리키는 경우가 있어 추가
        protocol: 'https',
        hostname: 'image.rocketpunch.com',
      },
    ],
  },
};

export default nextConfig;
