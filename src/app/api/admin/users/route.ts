import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAllUsers, createUser } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_ROLES: UserRole[] = ["super_admin", "admin", "cashier", "chef"];

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "manage_users");
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await getAllUsers();
    // Strip passwordHash before sending to client
    const safeUsers = users.map(({ passwordHash, PK, SK, entityType, ...rest }) => rest);
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "manage_users");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { username, password, role, name } = body;

    if (!username || !password || !role || !name) {
      return NextResponse.json(
        { error: "Missing required fields: username, password, role, name" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ username, passwordHash, role, name });

    const { passwordHash: _, PK, SK, entityType, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "A user with this username already exists" }, { status: 409 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
