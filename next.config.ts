import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/join",
        destination: "/membership#register",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/membership#register",
        permanent: true,
      },
      {
        source: "/resources",
        destination: "/membership",
        permanent: true,
      },
      {
        source: "/opportunities",
        destination: "/innovations",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
