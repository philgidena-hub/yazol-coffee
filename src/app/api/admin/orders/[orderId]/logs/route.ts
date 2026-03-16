import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await requirePermission(request, "view_live_orders");
  if (auth instanceof NextResponse) return auth;

  try {
    const { orderId } = await params;
    const logs = await getAuditLogs(orderId);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
