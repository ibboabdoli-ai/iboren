import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/jobb",
        destination: "/jobba-hos-oss",
        permanent: true
      },
      {
        source: "/om-iboren",
        destination: "/om-oss",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
