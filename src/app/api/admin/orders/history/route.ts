import { NextRequest, NextResponse } from "next/server";
import { getCompletedOrders } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const orders = await getCompletedOrders(Math.min(Math.max(limit, 1), 200));
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 });
  }
}
