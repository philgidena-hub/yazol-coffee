import type { UserRole, Order } from "./types";

// ── Status Transition Permissions ───────────────────────────
// Maps each status transition to the roles that can perform it.

type StatusTransition = `${Order["status"]}->${Order["status"]}`;

const STATUS_TRANSITION_ROLES: Partial<Record<StatusTransition, UserRole[]>> = {
  "pending->confirmed": ["super_admin", "admin", "cashier"],
  "confirmed->preparing": ["super_admin", "admin", "chef"],
  "preparing->ready": ["super_admin", "admin", "chef"],
  "ready->completed": ["super_admin", "admin", "cashier"],
};

export function canTransitionStatus(
  role: UserRole,
  fromStatus: Order["status"],
  toStatus: Order["status"]
): boolean {
  const key = `${fromStatus}->${toStatus}` as StatusTransition;
  return STATUS_TRANSITION_ROLES[key]?.includes(role) ?? false;
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
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

const STATUS_LABELS: Record<Order["status"], { label: string; confirmMsg: string }> = {
  pending: { label: "Pending", confirmMsg: "" },
  confirmed: { label: "Confirm", confirmMsg: "Confirm this order? The customer will be notified." },
  preparing: { label: "Start Preparing", confirmMsg: "Start preparing this order? Inventory will be deducted." },
  ready: { label: "Mark Ready", confirmMsg: "Mark this order as ready for pickup?" },
  completed: { label: "Complete", confirmMsg: "Complete this order? It will be moved to history." },
};

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
