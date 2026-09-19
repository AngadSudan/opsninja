import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/offline",
  "/privacy-policy",
  "/signin",
  "/signup",
  "/oauth",
  "/oauth/success",
  "/auth-success",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("application_token");
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!token && !isPublic) {
    const url = new URL("/signin", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)",
  ],
};
