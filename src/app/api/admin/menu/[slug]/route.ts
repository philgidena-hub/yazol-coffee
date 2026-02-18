import { NextRequest, NextResponse } from "next/server";
import { updateMenuItem, deleteMenuItem } from "@/lib/admin-db";
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
    const { name, description, category, categorySlug, price, isAvailable, imageKey, ingredients } = body;

    if (
      name === undefined &&
      description === undefined &&
      category === undefined &&
      categorySlug === undefined &&
      price === undefined &&
      isAvailable === undefined &&
      imageKey === undefined &&
      ingredients === undefined
    ) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }

    await updateMenuItem(slug, {
      name,
      description,
      category,
      categorySlug,
      price,
      isAvailable,
      imageKey,
      ingredients,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }
    console.error("Error updating menu item:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
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
    await deleteMenuItem(slug);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }
    console.error("Error deleting menu item:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
