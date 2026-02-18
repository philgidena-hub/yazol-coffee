import { NextRequest, NextResponse } from "next/server";
import { getDailyStats } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "view_dashboard_stats");
  if (auth instanceof NextResponse) return auth;

  try {
    const stats = await getDailyStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily stats" },
      { status: 500 }
    );
  }
}
