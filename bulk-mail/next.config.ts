import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  serverExternalPackages: ["nodemailer", "exceljs"],
};

export default nextConfig;
