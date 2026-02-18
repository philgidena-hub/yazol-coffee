import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { UserRole } from "./types";
import type { Feature } from "./permissions";
import { hasPermission } from "./permissions";

interface AuthResult {
  username: string;
  role: UserRole;
  name: string;
}

/** Extract user info from JWT token on an API request. Returns null if not authenticated. */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthResult | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token || !token.role || !token.username) return null;

  return {
    username: token.username as string,
    role: token.role as UserRole,
    name: token.name as string,
  };
}

/** Return a 403 Forbidden response */
export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** Get auth user and check a feature permission in one call */
export async function requirePermission(
  request: NextRequest,
  feature: Feature
): Promise<AuthResult | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.role, feature)) {
    return forbidden(
      `Role "${user.role}" does not have permission for "${feature}"`
    );
  }
  return user;
}
