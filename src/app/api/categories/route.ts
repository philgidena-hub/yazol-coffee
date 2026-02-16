import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/dynamodb";

export async function GET() {
  try {
    const categories = await getAllCategories();

    // Sort by sortOrder
    const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ categories: sortedCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
