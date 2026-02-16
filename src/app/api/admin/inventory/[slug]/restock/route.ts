import { NextRequest, NextResponse } from "next/server";
import { restockInventoryItem } from "@/lib/admin-db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { amount } = await request.json();

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    await restockInventoryItem(slug, amount);
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
