import { NextRequest, NextResponse } from "next/server";
import { getAllInventoryItems } from "@/lib/dynamodb";
import { getAuthUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allItems = await getAllInventoryItems();
    const lowStock = allItems.filter(
      (i) => i.currentStock <= i.lowStockThreshold
    );

    return NextResponse.json({ items: lowStock });
  } catch (error) {
    console.error("Error fetching low-stock items:", error);
    return NextResponse.json(
      { error: "Failed to fetch low-stock items" },
      { status: 500 }
    );
  }
}
