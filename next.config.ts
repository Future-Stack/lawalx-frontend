import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lawaltwo.sakibalhasa.xyz",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lawaltwo.sakibalhasa.xyz",
      },
      {
        protocol: "https",
        hostname: "*.ngrok-free.dev",
      },
      {
        protocol: "https",
        hostname: "*.ngrok.io",
      },
    ],
  },
};

export default nextConfig;
