import type { NextConfig } from "next";

const MAMORUBA_CALCULATOR_URL = "https://mamoruba-calculator.vercel.app";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/characters/**",
      },
      {
        pathname: "/death-tech-logo-horizontal.png",
      },
      {
        pathname: "/death-tech-association-logo.png",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/calculator",
        destination: MAMORUBA_CALCULATOR_URL,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
