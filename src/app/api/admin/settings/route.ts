import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Admin GET — returns full settings
export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// Admin PUT — super_admin only
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only super_admin can update settings
  if (session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Only the owner can update site settings" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await saveSiteSettings(body, session.user.username || session.user.name || "admin");
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
