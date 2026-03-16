import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { searchCustomers } from "@/lib/admin-db";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "create_orders");
  if (auth instanceof NextResponse) return auth;

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ customers: [] });
  }

  try {
    const customers = await searchCustomers(q, 8);
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Customer search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
