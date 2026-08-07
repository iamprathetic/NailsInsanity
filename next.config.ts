import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it, Next may pick a
  // stray lockfile higher up the tree (e.g. in the user's home folder).
  turbopack: {
    root: path.join(__dirname),
  },
  // Allow Next.js to optimize product images from Cloudinary (and legacy Blob).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
