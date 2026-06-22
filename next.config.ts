import type { NextConfig } from "next";

// printhub3d.club DNS 生效后，把 "/PrintHub" 改成 ""
const basePath = "/PrintHub";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
