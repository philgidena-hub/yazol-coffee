import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { updateUser, deleteUser } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";
import type { UserRole } from "@/lib/types";

const VALID_ROLES: UserRole[] = ["super_admin", "admin", "cashier", "chef"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const auth = await requirePermission(request, "manage_users");
  if (auth instanceof NextResponse) return auth;

  try {
    const { username } = await params;
    const body = await request.json();
    const { role, name, active, password } = body;

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent self-demotion from super_admin
    if (
      "username" in auth &&
      auth.username === username &&
      role !== undefined &&
      role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const updateData: {
      role?: UserRole;
      name?: string;
      active?: boolean;
      passwordHash?: string;
    } = {};
    if (role !== undefined) updateData.role = role;
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await updateUser(username, updateData);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const auth = await requirePermission(request, "manage_users");
  if (auth instanceof NextResponse) return auth;

  try {
    const { username } = await params;

    // Prevent self-deletion
    if ("username" in auth && auth.username === username) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await deleteUser(username);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
