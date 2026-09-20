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
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("application_token");

  console.log("MIDDLEWARE PATH:", pathname);
  console.log("MIDDLEWARE TOKEN:", token ? "FOUND" : "NOT FOUND");
  console.log(
    "MIDDLEWARE COOKIES:",
    request.cookies.getAll().map((cookie) => cookie.name),
  );

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)",
  ],
};
