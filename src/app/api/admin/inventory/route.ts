import { NextRequest, NextResponse } from "next/server";
import { getAllInventoryItems } from "@/lib/dynamodb";
import { createInventoryItem } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getAllInventoryItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, unit, currentStock, lowStockThreshold } = body;

    if (!name || !unit || typeof currentStock !== "number" || typeof lowStockThreshold !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: name, unit, currentStock, lowStockThreshold" },
        { status: 400 }
      );
    }

    if (currentStock < 0 || lowStockThreshold < 0) {
      return NextResponse.json({ error: "Stock values must be non-negative" }, { status: 400 });
    }

    const item = await createInventoryItem({ name, unit, currentStock, lowStockThreshold });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ConditionalCheckFailedException") {
      return NextResponse.json({ error: "An inventory item with this name already exists" }, { status: 409 });
    }
    console.error("Error creating inventory item:", error);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
