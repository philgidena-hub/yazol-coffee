import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "./types";
import type { Feature } from "./permissions";
import { hasPermission } from "./permissions";

interface AuthResult {
  username: string;
  role: UserRole;
  name: string;
}

/** Extract user info from session on an API request. Returns null if not authenticated. */
export async function getAuthUser(
  _request: NextRequest
): Promise<AuthResult | null> {
  const session = await auth();
  if (!session?.user || !session.user.role || !session.user.username) return null;

  return {
    username: session.user.username,
    role: session.user.role as UserRole,
    name: session.user.name as string,
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
