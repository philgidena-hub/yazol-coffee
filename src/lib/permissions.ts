import type { UserRole, Order } from "./types";

// ── Status Transition Permissions ───────────────────────────
// Maps each status transition to the roles that can perform it.

type StatusTransition = `${Order["status"]}->${Order["status"]}`;

const STATUS_TRANSITION_ROLES: Partial<Record<StatusTransition, UserRole[]>> = {
  // Normal sequential transitions
  "pending->approved":    ["super_admin", "admin", "cashier"],
  "approved->preparing":  ["super_admin", "admin", "chef"],
  "preparing->prepared":  ["super_admin", "admin", "chef"],
  "prepared->completed":  ["super_admin", "admin", "cashier"],
  "pending->cancelled":   ["super_admin", "admin", "cashier"],
  // Admin override: skip-step transitions
  "pending->preparing":   ["super_admin", "admin"],
  "pending->prepared":    ["super_admin", "admin"],
  "pending->completed":   ["super_admin", "admin"],
  "approved->prepared":   ["super_admin", "admin"],
  "approved->completed":  ["super_admin", "admin"],
  "preparing->completed": ["super_admin", "admin"],
};

export function canTransitionStatus(
  role: UserRole,
  fromStatus: Order["status"],
  toStatus: Order["status"]
): boolean {
  const key = `${fromStatus}->${toStatus}` as StatusTransition;
  return STATUS_TRANSITION_ROLES[key]?.includes(role) ?? false;
}

/** Check if a user can cancel an order given its current status */
export function canCancelOrder(currentStatus: Order["status"], role: UserRole): boolean {
  if (currentStatus === "completed" || currentStatus === "cancelled") return false;
  // Cashier can cancel pending orders
  if (currentStatus === "pending") {
    return canTransitionStatus(role, "pending", "cancelled");
  }
  // Admin/super_admin can emergency-cancel any active order
  return role === "super_admin" || role === "admin";
}

// ── Feature Permissions ─────────────────────────────────────

export type Feature =
  | "view_dashboard_stats"
  | "view_live_orders"
  | "view_order_history"
  | "manage_inventory"
  | "manage_menu"
  | "manage_users";

const FEATURE_ROLES: Record<Feature, UserRole[]> = {
  view_dashboard_stats: ["super_admin", "admin"],
  view_live_orders: ["super_admin", "admin", "cashier", "chef"],
  view_order_history: ["super_admin", "admin", "cashier"],
  manage_inventory: ["super_admin", "admin"],
  manage_menu: ["super_admin", "admin"],
  manage_users: ["super_admin"],
};

export function hasPermission(role: UserRole, feature: Feature): boolean {
  return FEATURE_ROLES[feature]?.includes(role) ?? false;
}

// ── Tab Visibility ──────────────────────────────────────────

export type AdminTab = "orders" | "inventory" | "menu" | "history" | "analytics" | "users";

export function getVisibleTabs(role: UserRole): AdminTab[] {
  const tabs: AdminTab[] = [];

  if (hasPermission(role, "view_live_orders")) tabs.push("orders");
  if (hasPermission(role, "manage_inventory")) tabs.push("inventory");
  if (hasPermission(role, "manage_menu")) tabs.push("menu");
  if (hasPermission(role, "view_order_history")) tabs.push("history");
  if (hasPermission(role, "view_dashboard_stats")) tabs.push("analytics");
  if (hasPermission(role, "manage_users")) tabs.push("users");

  return tabs;
}

// ── Next Status Actions for OrderCard ───────────────────────

const STATUS_ORDER: Order["status"][] = [
  "pending",
  "approved",
  "preparing",
  "prepared",
  "completed",
];

const STATUS_LABELS: Record<Order["status"], { label: string; confirmMsg: string }> = {
  pending:   { label: "Pending",         confirmMsg: "" },
  approved:  { label: "Approve",         confirmMsg: "Approve this order? Inventory will be reserved." },
  preparing: { label: "Start Preparing", confirmMsg: "Start preparing this order?" },
  prepared:  { label: "Mark Prepared",   confirmMsg: "Mark this order as prepared for pickup?" },
  completed: { label: "Complete",        confirmMsg: "Complete this order? It will be moved to history." },
  cancelled: { label: "Cancelled",       confirmMsg: "" },
};

export { STATUS_ORDER, STATUS_LABELS };

export function getNextStatusActions(
  currentStatus: Order["status"],
  role: UserRole
): { status: Order["status"]; label: string; confirmMsg: string }[] {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentIdx === -1 || currentIdx >= STATUS_ORDER.length - 1) return [];

  const nextStatus = STATUS_ORDER[currentIdx + 1];
  if (canTransitionStatus(role, currentStatus, nextStatus)) {
    return [{ status: nextStatus, ...STATUS_LABELS[nextStatus] }];
  }

  return [];
}

/** Get admin skip-step actions (statuses beyond the immediate next that admin can jump to) */
export function getAdminOverrideActions(
  currentStatus: Order["status"],
  role: UserRole
): { status: Order["status"]; label: string; confirmMsg: string }[] {
  if (role !== "super_admin" && role !== "admin") return [];

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentIdx === -1 || currentIdx >= STATUS_ORDER.length - 1) return [];

  const actions: { status: Order["status"]; label: string; confirmMsg: string }[] = [];

  // Start from currentIdx + 2 (skip the immediate next, which is shown as the primary action)
  for (let i = currentIdx + 2; i < STATUS_ORDER.length; i++) {
    const targetStatus = STATUS_ORDER[i];
    if (canTransitionStatus(role, currentStatus, targetStatus)) {
      const displayName = targetStatus.charAt(0).toUpperCase() + targetStatus.slice(1);
      actions.push({
        status: targetStatus,
        label: `Skip to ${displayName}`,
        confirmMsg: `Skip directly to "${displayName}"? This will bypass intermediate steps.${
          currentIdx < STATUS_ORDER.indexOf("approved") && i >= STATUS_ORDER.indexOf("approved")
            ? " Inventory will be validated and deducted."
            : ""
        }`,
      });
    }
  }

  return actions;
}
