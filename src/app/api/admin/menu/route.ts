import { NextRequest, NextResponse } from "next/server";
import { getAllMenuItems } from "@/lib/dynamodb";
import { createMenuItem } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getAllMenuItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, description, category, categorySlug, price, isAvailable, imageKey, ingredients } = body;

    if (!name || !description || !category || !categorySlug || typeof price !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: name, description, category, categorySlug, price" },
        { status: 400 }
      );
    }

    const item = await createMenuItem({
      name,
      description,
      category,
      categorySlug,
      price,
      isAvailable: isAvailable ?? true,
      imageKey: imageKey || "",
      ingredients: ingredients || [],
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "A menu item with this name already exists" }, { status: 409 });
    }
    console.error("Error creating menu item:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
