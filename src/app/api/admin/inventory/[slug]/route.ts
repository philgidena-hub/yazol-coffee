import { NextRequest, NextResponse } from "next/server";
import { updateInventoryItem, deleteInventoryItem } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_inventory");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, unit, lowStockThreshold } = body;

    if (name === undefined && unit === undefined && lowStockThreshold === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (lowStockThreshold !== undefined && (typeof lowStockThreshold !== "number" || lowStockThreshold < 0)) {
      return NextResponse.json({ error: "Low stock threshold must be a non-negative number" }, { status: 400 });
    }

    await updateInventoryItem(slug, { name, unit, lowStockThreshold });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }
    console.error("Error updating inventory item:", error);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_inventory");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    await deleteInventoryItem(slug);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }
    console.error("Error deleting inventory item:", error);
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 });
  }
}
