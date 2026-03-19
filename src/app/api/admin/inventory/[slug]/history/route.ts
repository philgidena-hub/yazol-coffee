import { NextRequest, NextResponse } from "next/server";
import { getStockHistory } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_inventory");
  if (auth instanceof NextResponse) return auth;

  const { slug } = await params;
  const history = await getStockHistory(slug);
  return NextResponse.json({ history });
}
