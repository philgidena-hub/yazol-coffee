import { NextRequest, NextResponse } from "next/server";
import { restockInventoryItem, getInventoryItem, logStockMovement } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_inventory");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const { amount } = await request.json();

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Get current stock before restock
    const item = await getInventoryItem(slug);
    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    const previousStock = item.currentStock;
    await restockInventoryItem(slug, amount);
    const newStock = previousStock + amount;

    // Log the movement
    const username = (auth as { username?: string }).username || "admin";
    await logStockMovement({
      inventorySlug: slug,
      inventoryName: item.name,
      type: "restock",
      quantity: amount,
      previousStock,
      newStock,
      performedBy: username,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }
    console.error("Error restocking inventory:", error);
    return NextResponse.json(
      { error: "Failed to restock inventory item" },
      { status: 500 }
    );
  }
}
