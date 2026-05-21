import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return [
      { source: "/booking", destination: "/boka", permanent: true },
      { source: "/jobb", destination: "/jobba-hos-oss", permanent: true },
      { source: "/om-iboren", destination: "/om-oss", permanent: true },
      { source: "/hemstadning", destination: "/tjanster/hemstadning", permanent: true },
      { source: "/flyttstadning", destination: "/tjanster/flyttstadning", permanent: true },
      { source: "/kontorsstadning", destination: "/tjanster/kontorsstadning", permanent: true },
      { source: "/fonsterputs", destination: "/tjanster/fonsterputs", permanent: true }
    ];
  }
};

export default nextConfig;
