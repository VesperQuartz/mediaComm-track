import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["pino", "pino-pretty", "hono-pino/debug-log"],
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    authInterrupts: true,
    typedEnv: true,
    optimizeCss: true,
  },
  reactCompiler: true,
  allowedDevOrigins: ["mrlectus.local"],
  cacheComponents: true,
};

export default nextConfig;
