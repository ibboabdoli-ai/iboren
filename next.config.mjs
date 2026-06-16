/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app https://maps.googleapis.com https://maps.gstatic.com https://chat.proffera.se",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: *.supabase.co *.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.resend.com https://vercel.live https://*.vercel.app https://maps.googleapis.com https://maps.gstatic.com https://chat.proffera.se wss://*.supabase.co",
      "frame-src 'self' https://*.supabase.co https://accounts.google.com https://www.linkedin.com https://login.microsoftonline.com",
      "upgrade-insecure-requests"
    ].join("; ")
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  },
  async redirects() {
    return [
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
