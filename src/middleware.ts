import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // Protect all internal dashboard routes: redirect to login if unauthenticated
  if (!sessionToken) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview",
    "/overview/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/workspace",
    "/workspace/:path*",
    "/decks",
    "/decks/:path*",
    "/automation",
    "/automation/:path*",
    "/integrations",
    "/integrations/:path*",
    "/settings",
    "/settings/:path*",
    "/ai-hub",
    "/ai-hub/:path*",
    "/agentic-vision",
    "/agentic-vision/:path*",
  ],
};
