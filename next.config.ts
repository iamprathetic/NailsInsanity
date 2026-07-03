import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it, Next may pick a
  // stray lockfile higher up the tree (e.g. in the user's home folder).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
