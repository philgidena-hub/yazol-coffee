import { NextRequest, NextResponse } from "next/server";
import { toggleMenuItemAvailability } from "@/lib/admin-db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
