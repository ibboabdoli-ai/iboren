import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isAllowedGoogleAvatarUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:" && (hostname === "googleusercontent.com" || hostname.endsWith(".googleusercontent.com"));
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const avatarUrl = requestUrl.searchParams.get("url") || "";

  if (!avatarUrl || !isAllowedGoogleAvatarUrl(avatarUrl)) {
    return NextResponse.json({ ok: false, message: "Invalid avatar URL." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(avatarUrl, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      signal: controller.signal
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, message: "Avatar could not be loaded." }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return NextResponse.json({ ok: false, message: "Avatar response is not an image." }, { status: 502 });
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
      }
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Avatar proxy failed." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
