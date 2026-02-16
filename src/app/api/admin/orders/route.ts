import { NextResponse } from "next/server";
import { getActiveOrders } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getActiveOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
