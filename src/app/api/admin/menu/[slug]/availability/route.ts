import { NextRequest, NextResponse } from "next/server";
import { toggleMenuItemAvailability } from "@/lib/admin-db";
import { requirePermission } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requirePermission(request, "manage_menu");
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const { isAvailable } = await request.json();

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "isAvailable must be a boolean" },
        { status: 400 }
      );
    }

    await toggleMenuItemAvailability(slug, isAvailable);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
