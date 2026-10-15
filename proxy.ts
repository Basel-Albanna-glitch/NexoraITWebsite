import { NextResponse, type NextRequest } from "next/server";

// English lives at the root (/services), Arabic under /ar (/ar/services).
// Internally every public page is rendered from app/(site)/[lang], so English URLs are rewritten to /en/…
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/ar" || pathname.startsWith("/ar/")) return NextResponse.next();

  // /en/... is an internal path — send visitors to the clean URL so each page has one address.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, APIs, the dashboard, uploaded media and any file with an extension (images, robots.txt…).
  matcher: ["/((?!_next/|api/|admin|media/|.*\\..*).*)"],
};
