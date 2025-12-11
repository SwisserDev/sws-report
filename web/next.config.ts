import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  assetPrefix: "./",
  reactStrictMode: false,
  poweredByHeader: false,
  compress: false,
  productionBrowserSourceMaps: false
}

export default nextConfig
