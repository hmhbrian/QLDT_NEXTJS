import { NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/admin",
  "/hr",
  "/dashboard",
  "/profile",
  "/settings",
  "/courses",
  "/trainee",
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/api/public", "/api/health"];

function isProtectedRoute(pathname: string): boolean {
  // The root path "/" is a special case handled separately
  if (pathname === "/") return false;
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function hasAuthCookie(request: NextRequest): boolean {
  // Check for the new simplified auth token name
  const authToken = request.cookies.get("qldt_auth_token");
  return !!authToken?.value;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = hasAuthCookie(request);

  // 1. Handle the root path "/"
  if (pathname === "/") {
    const destination = hasAuth ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 2. Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(pathname) && !hasAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Redirect authenticated users away from login page
  if (pathname === "/login" && hasAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If none of the above conditions are met, proceed with the request
  const response = NextResponse.next();

  // Add security headers for all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and files with extensions (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};