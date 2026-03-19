import { NextRequest, NextResponse } from "next/server";
import { recordWaste } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_inventory");
  if (auth instanceof NextResponse) return auth;

  const { slug } = await params;
  const { amount, reason } = await request.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: "Reason is required for waste records" }, { status: 400 });
  }

  try {
    const username = (auth as { username?: string }).username || "admin";
    await recordWaste(slug, amount, reason.trim(), username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waste recording error:", error);
    return NextResponse.json({ error: "Failed to record waste" }, { status: 500 });
  }
}
