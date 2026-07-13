export function safeInternalNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/profile";

  const nextUrl = new URL(value, "https://iboren.invalid");
  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
}
