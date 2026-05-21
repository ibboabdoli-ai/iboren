import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cinematic/") && pathname.endsWith(".webp")) {
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = "/_next/image";
    rewritten.search = "";
    rewritten.searchParams.set("url", pathname);
    rewritten.searchParams.set("w", "1200");
    rewritten.searchParams.set("q", "65");
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cinematic/:path*"]
};
