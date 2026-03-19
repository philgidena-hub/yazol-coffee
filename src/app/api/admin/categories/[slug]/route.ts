import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/admin-db";
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
    const { name, sortOrder, section } = body;

    if (name === undefined && sortOrder === undefined && section === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await updateCategory(slug, { name, sortOrder, section });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    await deleteCategory(slug);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
