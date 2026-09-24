import type { NextConfig } from "next";
import path from "path";

// Only Razorpay's checkout script/modal (dynamically loaded on the checkout
// page) needs cross-origin allowances; every other asset is self-hosted.
// 'unsafe-eval' is dev-only — React's dev-mode debugging tools use eval(),
// but React itself never uses it in production builds.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === "production" ? [] : ["'unsafe-eval'"]),
  "https://checkout.razorpay.com",
  "https://*.razorpay.com",
].join(" ");

const csp = [
  "default-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `script-src ${scriptSrc}`,
  "connect-src 'self' https://*.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://*.razorpay.com https://api.razorpay.com",
  "img-src 'self' data: https://res.cloudinary.com https://*.public.blob.vercel-storage.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
].join("; ");

const nextConfig: NextConfig = {
  // Hide the Next.js version fingerprint (X-Powered-By header).
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
