/** @type {import('next').NextConfig} */
const nextConfig = {
  // NCloud 배포: standalone 빌드로 산출물 최소화 (deploy.sh 의 npm ci --omit=dev 가 가벼워짐)
  output: "standalone",
  // Next.js 16 설정
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
