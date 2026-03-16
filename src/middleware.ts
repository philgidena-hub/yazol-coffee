import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't protect auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Admin API routes — return 401 if unauthenticated ────────
  if (pathname.startsWith("/api/admin")) {
    if (!token || !token.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Admin pages ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (!token && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (token && isLoginPage && token.isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (token && !token.isAdmin && !isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
