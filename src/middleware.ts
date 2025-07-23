import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Xử lý các yêu cầu preflight CORS
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");

    return response;
  }

  // Thêm headers CORS cho tất cả phản hồi API
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next();

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
