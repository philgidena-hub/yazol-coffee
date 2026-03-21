import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Set to true to show coming-soon page to all public visitors
const COMING_SOON = true;

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

  // ── Coming Soon redirect ────────────────────────────────────
  // Redirect all public pages to /coming-soon (except API routes, admin, and the page itself)
  if (COMING_SOON) {
    const isAllowed =
      pathname === "/coming-soon" ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/_next");

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/coming-soon", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
