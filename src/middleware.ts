import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Handle RSC requests that cause navigation delays
  const url = request.nextUrl.clone();

  // Remove problematic RSC query parameters that cause caching delays
  if (url.searchParams.has("_rsc")) {
    url.searchParams.delete("_rsc");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  // Add headers to prevent excessive caching for page routes
  if (
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/_next")
  ) {
    // Disable aggressive caching for navigation
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // Xử lý các yêu cầu preflight CORS
  if (request.method === "OPTIONS") {
    const corsResponse = new NextResponse(null, { status: 200 });

    corsResponse.headers.set("Access-Control-Allow-Origin", "*");
    corsResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    corsResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, If-None-Match, If-Modified-Since"
    );
    corsResponse.headers.set("Access-Control-Allow-Credentials", "true");
    corsResponse.headers.set("Access-Control-Max-Age", "86400");

    return corsResponse;
  }

  // Thêm headers CORS cho tất cả phản hồi API
  if (request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, If-None-Match, If-Modified-Since"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    // Add cache control headers
    if (request.method === "GET") {
      // Check if it's a data endpoint that should be cached
      const isDataEndpoint =
        request.nextUrl.pathname.includes("/data/") ||
        request.nextUrl.pathname.includes("/courses") ||
        request.nextUrl.pathname.includes("/users");

      if (isDataEndpoint) {
        // Add ETag support
        const etag = `"${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}"`;
        response.headers.set("ETag", etag);

        // Check if client has cached version
        const ifNoneMatch = request.headers.get("if-none-match");
        if (ifNoneMatch && ifNoneMatch === etag) {
          return new NextResponse(null, { status: 304 });
        }

        // Set cache control
        response.headers.set(
          "Cache-Control",
          "private, max-age=300, must-revalidate"
        ); // 5 minutes
        response.headers.set("Last-Modified", new Date().toUTCString());
      } else {
        // No cache for sensitive endpoints
        response.headers.set(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
      }
    } else {
      // No cache for non-GET requests
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
    }

    return response;
  }

  // Add security headers for all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Add CSP header - allow localhost in development
  const isDevelopment = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    isDevelopment
      ? "connect-src 'self' https: wss: ws: http://localhost:* http://127.0.0.1:*"
      : "connect-src 'self' https: wss: ws:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  if (!isDevelopment) {
    response.headers.set("Content-Security-Policy", csp);
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
