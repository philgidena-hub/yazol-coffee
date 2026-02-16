import { NextResponse } from "next/server";
import { getAllMenuItems, getMenuItemsByCategory } from "@/lib/dynamodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let menuItems;

    if (category) {
      menuItems = await getMenuItemsByCategory(category);
    } else {
      menuItems = await getAllMenuItems();
    }

    // Filter only available items (optional - can be controlled by query param)
    const availableOnly = searchParams.get("available") === "true";
    const filteredItems = availableOnly
      ? menuItems.filter((item) => item.isAvailable)
      : menuItems;

    return NextResponse.json({ menuItems: filteredItems });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
