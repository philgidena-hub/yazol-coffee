import { NextResponse } from "next/server";
import { getDailyStats } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET() {
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
