import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;

  // ── Admin API routes — return 401 if unauthenticated ────────
  if (pathname.startsWith("/api/admin")) {
    if (!token || !token.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Admin pages ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (!token && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (token && isLoginPage && token.user?.isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (token && !token.user?.isAdmin && !isLoginPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
