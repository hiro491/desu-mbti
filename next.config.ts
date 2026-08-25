import type { NextConfig } from "next";

const MAMORUBA_CALCULATOR_URL = "https://mamoruba-calculator.vercel.app";

const nextConfig: NextConfig = {
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
