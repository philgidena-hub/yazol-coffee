import { NextResponse } from "next/server";
import { getAllMainCategories } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mainCategories = await getAllMainCategories();
    const sorted = mainCategories.sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ mainCategories: sorted });
  } catch (error) {
    console.error("Error fetching main categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch main categories" },
      { status: 500 }
    );
  }
}
