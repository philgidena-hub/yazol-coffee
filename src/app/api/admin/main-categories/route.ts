import { NextRequest, NextResponse } from "next/server";
import { getAllMainCategories } from "@/lib/dynamodb";
import { createMainCategory } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const mainCategories = await getAllMainCategories();
    const sorted = mainCategories.sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ mainCategories: sorted });
  } catch (error) {
    console.error("Error fetching main categories:", error);
    return NextResponse.json({ error: "Failed to fetch main categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, subtitle, sortOrder, iconType, accentColor } = body;

    if (!name || typeof sortOrder !== "number" || !iconType || !accentColor) {
      return NextResponse.json(
        { error: "Missing required fields: name, sortOrder, iconType, accentColor" },
        { status: 400 }
      );
    }

    if (iconType !== "coffee" && iconType !== "ice-cream") {
      return NextResponse.json(
        { error: "iconType must be 'coffee' or 'ice-cream'" },
        { status: 400 }
      );
    }

    const mainCategory = await createMainCategory({
      name,
      subtitle: subtitle || "",
      sortOrder,
      iconType,
      accentColor,
    });

    return NextResponse.json({ mainCategory }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "A main category with this name already exists" }, { status: 409 });
    }
    console.error("Error creating main category:", error);
    return NextResponse.json({ error: "Failed to create main category" }, { status: 500 });
  }
}
