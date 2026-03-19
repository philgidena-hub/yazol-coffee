import { NextRequest, NextResponse } from "next/server";
import { getAllCategories } from "@/lib/dynamodb";
import { createCategory } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const categories = await getAllCategories();
    const sorted = categories.sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ categories: sorted });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, sortOrder, section } = body;

    if (!name || typeof sortOrder !== "number" || !section) {
      return NextResponse.json(
        { error: "Missing required fields: name, sortOrder, section" },
        { status: 400 }
      );
    }

    const category = await createCategory({ name, sortOrder, section });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
