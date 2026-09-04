import type { NextConfig } from "next";

const repo = "class-op";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: `/${repo}`,
  },
};

export default nextConfig;
