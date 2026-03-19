import { NextRequest, NextResponse } from "next/server";
import { updateMainCategory, deleteMainCategory } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, subtitle, sortOrder, iconType, accentColor } = body;

    if (name === undefined && subtitle === undefined && sortOrder === undefined && iconType === undefined && accentColor === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (iconType !== undefined && iconType !== "coffee" && iconType !== "ice-cream") {
      return NextResponse.json(
        { error: "iconType must be 'coffee' or 'ice-cream'" },
        { status: 400 }
      );
    }

    await updateMainCategory(slug, { name, subtitle, sortOrder, iconType, accentColor });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Main category not found" }, { status: 404 });
    }
    console.error("Error updating main category:", error);
    return NextResponse.json({ error: "Failed to update main category" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    await deleteMainCategory(slug);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Main category not found" }, { status: 404 });
    }
    console.error("Error deleting main category:", error);
    return NextResponse.json({ error: "Failed to delete main category" }, { status: 500 });
  }
}
