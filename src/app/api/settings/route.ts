import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

// Public GET — anyone can read site settings (for footer, hours, etc.)
export async function GET() {
  try {
    const settings = await getSiteSettings();
    // Strip DynamoDB keys from public response
    const { PK, SK, entityType, ...publicSettings } = settings;
    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
