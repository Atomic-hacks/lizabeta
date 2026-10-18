import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Plate renders photography at 88; Next 16 requires it to be declared.
    qualities: [75, 88],
  },
};

export default nextConfig;
