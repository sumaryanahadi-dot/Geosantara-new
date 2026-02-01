// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // biarin akses login & register
  if (pathname.startsWith("/api/login") || pathname.startsWith("/api/register")) {
    return NextResponse.next();
  }

  const userId = req.cookies.get("user_id")?.value;

  if (!userId) {
    // redirect ke login kalau ga ada cookie
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"], // semua halaman /protected/* bakal dicek
};
