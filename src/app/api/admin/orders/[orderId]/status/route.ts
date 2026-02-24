import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus, deductInventoryForOrder, validateStockForOrder, checkAndDisableOutOfStockItems, createAuditLog } from "@/lib/admin-db";
import { getAuthUser, forbidden } from "@/lib/api-auth";
import { canTransitionStatus, canCancelOrder } from "@/lib/permissions";
import type { Order } from "@/lib/types";

const STATUS_ORDER: Order["status"][] = [
  "pending",
  "approved",
  "preparing",
  "prepared",
  "completed",
];

const VALID_STATUSES: Order["status"][] = [...STATUS_ORDER, "cancelled"];

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

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch current order to validate transition
    const currentOrder = await getOrder(orderId);
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle cancellation separately
    if (newStatus === "cancelled") {
      if (!canCancelOrder(currentOrder.status, user.role)) {
        return forbidden(
          `Role "${user.role}" cannot cancel orders in "${currentOrder.status}" status`
        );
      }

      const updatedOrder = await updateOrderStatus(orderId, "cancelled");
      await createAuditLog({
        orderId,
        username: user.username,
        userRole: user.role,
        fromStatus: currentOrder.status,
        toStatus: "cancelled",
        note: "Order cancelled",
      });
      return NextResponse.json({ order: updatedOrder });
    }

    // Forward-only transition check
    const currentIndex = STATUS_ORDER.indexOf(currentOrder.status);
    const newIndex = STATUS_ORDER.indexOf(newStatus);

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: `Order is in "${currentOrder.status}" status and cannot be transitioned.` },
        { status: 400 }
      );
    }

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

    // Determine if inventory should be validated/deducted:
    // - When transitioning to "approved"
    // - When admin skips past "approved" (e.g., pending -> preparing/prepared/completed)
    const approvedIdx = STATUS_ORDER.indexOf("approved");
    const needsInventoryAction =
      (newIndex >= approvedIdx && currentIndex < approvedIdx);

    if (needsInventoryAction) {
      const validation = await validateStockForOrder(currentOrder);
      if (!validation.valid) {
        const details = validation.insufficientItems
          .map((i) => `${i.ingredientName}: need ${i.required}${i.unit}, have ${i.available}${i.unit}`)
          .join("; ");
        return NextResponse.json(
          { error: `Insufficient stock: ${details}` },
          { status: 409 }
        );
      }
    }

    // Update the order status
    const updatedOrder = await updateOrderStatus(orderId, newStatus);

    // Log the status change
    await createAuditLog({
      orderId,
      username: user.username,
      userRole: user.role,
      fromStatus: currentOrder.status,
      toStatus: newStatus,
    });

    // Deduct inventory if passing through the approval checkpoint
    if (needsInventoryAction) {
      await deductInventoryForOrder(updatedOrder);
      await checkAndDisableOutOfStockItems();
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
