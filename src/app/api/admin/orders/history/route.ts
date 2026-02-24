import { NextRequest, NextResponse } from "next/server";
import { getFinishedOrders } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "view_order_history");
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const orders = await getFinishedOrders(Math.min(Math.max(limit, 1), 200));
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 });
  }
}
