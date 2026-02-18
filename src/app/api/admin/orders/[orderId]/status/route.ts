import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus, deductInventoryForOrder } from "@/lib/admin-db";
import { getAuthUser, forbidden } from "@/lib/api-auth";
import { canTransitionStatus } from "@/lib/permissions";
import type { Order } from "@/lib/types";

const STATUS_ORDER: Order["status"][] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const { status: newStatus } = await request.json();

    if (!STATUS_ORDER.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch current order to validate forward-only transition
    const currentOrder = await getOrder(orderId);
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentIndex = STATUS_ORDER.indexOf(currentOrder.status);
    const newIndex = STATUS_ORDER.indexOf(newStatus);

    if (newIndex <= currentIndex) {
      return NextResponse.json(
        { error: `Cannot move from "${currentOrder.status}" to "${newStatus}". Status can only move forward.` },
        { status: 400 }
      );
    }

    // Role-based transition check
    if (!canTransitionStatus(user.role, currentOrder.status, newStatus)) {
      return forbidden(
        `Role "${user.role}" cannot transition orders from "${currentOrder.status}" to "${newStatus}"`
      );
    }

    // Update the order status
    const updatedOrder = await updateOrderStatus(orderId, newStatus);

    // If transitioning to "preparing", deduct inventory atomically
    if (newStatus === "preparing") {
      await deductInventoryForOrder(updatedOrder);
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
