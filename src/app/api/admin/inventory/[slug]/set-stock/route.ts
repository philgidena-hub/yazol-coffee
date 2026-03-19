import { NextRequest, NextResponse } from "next/server";
import { setInventoryStock, getInventoryItem, logStockMovement } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_inventory");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const { stock } = await request.json();

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    // Get current stock before adjustment
    const item = await getInventoryItem(slug);
    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    const previousStock = item.currentStock;
    await setInventoryStock(slug, stock);

    // Log the adjustment
    const username = (auth as { username?: string }).username || "admin";
    await logStockMovement({
      inventorySlug: slug,
      inventoryName: item.name,
      type: "adjustment",
      quantity: stock - previousStock,
      previousStock,
      newStock: stock,
      reason: `Manual stock set from ${previousStock} to ${stock}`,
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
    console.error("Error setting inventory stock:", error);
    return NextResponse.json(
      { error: "Failed to set inventory stock" },
      { status: 500 }
    );
  }
}
