import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
