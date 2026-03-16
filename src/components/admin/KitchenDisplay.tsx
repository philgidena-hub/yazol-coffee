"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Order, UserRole } from "@/lib/types";
import { type Station, getStationForCategory, getStationLabel, getStationColor, canTransitionStatus } from "@/lib/permissions";
import { useToast } from "./AdminToast";
import { useNotifications } from "@/hooks/useNotifications";
import ConfirmModal from "./ConfirmModal";

interface KitchenDisplayProps {
  onOrderUpdate: () => void;
  role: UserRole;
}

function OrderTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "warning" | "urgent">("normal");

  useEffect(() => {
    function update() {
      const diffMs = Date.now() - new Date(createdAt).getTime();
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);
      setUrgency(mins >= 15 ? "urgent" : mins >= 8 ? "warning" : "normal");
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <span
      className={`text-lg font-mono font-bold tabular-nums ${
        urgency === "urgent"
          ? "text-red-400"
          : urgency === "warning"
          ? "text-amber-400"
          : "text-emerald-400"
      }`}
    >
      {elapsed}
    </span>
  );
}

export default function KitchenDisplay({ onOrderUpdate, role }: KitchenDisplayProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // Barista defaults to bar station, chef defaults to kitchen, admin sees all
  const defaultStation: "all" | Station = role === "barista" ? "bar" : role === "chef" ? "kitchen" : "all";
  const [stationFilter, setStationFilter] = useState<"all" | Station>(defaultStation);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ orderId: string; status: Order["status"]; label: string } | null>(null);
  const { toast } = useToast();
  const { notify } = useNotifications();

  // Fetch category map
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, string> = {};
          for (const item of data.items || []) {
            map[item.slug] = item.category;
          }
          setCategoryMap(map);
        }
      } catch { /* ignore */ }
    }
    fetchCategories();
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.orders) {
        // Only show orders in actionable states for kitchen: approved, preparing
        const kitchenOrders = (data.orders as Order[]).filter(
          (o) => o.status === "approved" || o.status === "preparing"
        );
        // Sort: preparing first (actively being worked), then approved (need attention)
        // Within each status, oldest first (FIFO)
        kitchenOrders.sort((a, b) => {
          if (a.status === b.status) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return a.status === "preparing" ? -1 : 1;
        });
        setOrders(kitchenOrders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    setConfirmAction(null);
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to update status", "error");
        return;
      }

      toast(`Order updated`, "success");
      if (newStatus === "prepared") {
        notify("Order Ready", `Order ready for pickup`);
      }
      await fetchOrders();
      onOrderUpdate();
    } catch {
      toast("Failed to update order status", "error");
    } finally {
      setUpdating(null);
    }
  };

  // Filter orders by station
  const filteredOrders = useMemo(() => {
    if (stationFilter === "all") return orders;

    return orders.filter((o) =>
      o.items.some((item) => {
        const cat = categoryMap[item.slug] || "";
        return getStationForCategory(cat) === stationFilter;
      })
    );
  }, [orders, stationFilter, categoryMap]);

  // Group items by station within an order
  const getOrderStationItems = (order: Order, station: Station) => {
    return order.items.filter((item) => {
      const cat = categoryMap[item.slug] || "";
      return getStationForCategory(cat) === station;
    });
  };

  const getNextAction = (order: Order): { status: Order["status"]; label: string } | null => {
    if (order.status === "approved" && canTransitionStatus(role, "approved", "preparing")) {
      return { status: "preparing", label: "Start Prep" };
    }
    if (order.status === "preparing" && canTransitionStatus(role, "preparing", "prepared")) {
      return { status: "prepared", label: "Mark Ready" };
    }
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-body font-semibold text-lg text-white">
            {role === "barista" ? "Bar Display" : role === "chef" ? "Kitchen Display" : "Prep Display"}
          </h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-xs font-body font-medium tabular-nums">
              {filteredOrders.length}
            </span>
          </span>
        </div>

        {/* Station filter */}
        <div className="flex items-center bg-slate-800/60 rounded-lg border border-slate-700/50 p-0.5">
          {(["all", "bar", "kitchen"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStationFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-body font-medium transition-all ${
                stationFilter === s
                  ? s === "bar"
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                    : s === "kitchen"
                    ? "bg-orange-500/20 text-orange-400 shadow-sm"
                    : "bg-slate-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s === "all" ? "All Stations" : s === "bar" ? "Barista" : "Kitchen"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/40 rounded-2xl border border-white/[0.06] animate-pulse h-48" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-16 border border-white/[0.06] text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 font-body text-sm">All caught up — no orders to prepare</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const action = getNextAction(order);
              const isPreparing = order.status === "preparing";
              const hasAllergyNotes = order.items.some((item) => item.allergyNotes);
              const barItems = getOrderStationItems(order, "bar");
              const kitchenItems = getOrderStationItems(order, "kitchen");

              return (
                <motion.div
                  key={order.orderId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-2xl border transition-all ${
                    isPreparing
                      ? "bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5"
                      : "bg-slate-900/60 border-white/[0.06]"
                  }`}
                >
                  {/* Card header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-body text-[11px] text-slate-500 font-mono tracking-wide">
                          #{order.orderId.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="font-body font-medium text-base text-white mt-0.5">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <OrderTimer createdAt={order.createdAt} />
                        <span className={`text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPreparing
                            ? "bg-orange-400/10 border-orange-400/30 text-orange-400"
                            : "bg-sky-400/10 border-sky-400/30 text-sky-400"
                        }`}>
                          {isPreparing ? "In Progress" : "Queued"}
                        </span>
                      </div>
                    </div>

                    {/* Allergy warning */}
                    {hasAllergyNotes && (
                      <div className="bg-red-950/40 border border-red-500/20 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[11px] font-body font-medium text-red-400">
                          ALLERGY ALERT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items grouped by station */}
                  <div className="px-4 pb-3">
                    {(stationFilter === "all" ? (["bar", "kitchen"] as Station[]) : [stationFilter]).map((station) => {
                      const items = station === "bar" ? barItems : kitchenItems;
                      if (items.length === 0) return null;
                      const sc = getStationColor(station);
                      return (
                        <div key={station} className="mb-2 last:mb-0">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-body font-semibold uppercase tracking-wider border mb-1.5 ${sc.bg} ${sc.border} ${sc.text}`}>
                            {getStationLabel(station)}
                          </span>
                          <div className="space-y-1">
                            {items.map((item, i) => (
                              <div key={i}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-body text-white">
                                    <span className="text-slate-500 font-medium mr-1.5">{item.quantity}x</span>
                                    {item.name}
                                  </span>
                                </div>
                                {item.allergyNotes && (
                                  <p className="text-[11px] font-body text-red-400 ml-6 mt-0.5 flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    {item.allergyNotes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Special instructions */}
                  {order.specialInstructions && (
                    <div className="px-4 pb-3">
                      <p className="text-[11px] font-body text-slate-500 italic bg-slate-800/40 rounded-md px-2.5 py-1.5 border border-slate-700/30">
                        {order.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Action button */}
                  {action && (
                    <div className="p-4 pt-0">
                      <button
                        onClick={() =>
                          setConfirmAction({
                            orderId: order.orderId,
                            status: action.status,
                            label: action.label,
                          })
                        }
                        disabled={updating === order.orderId}
                        className={`w-full py-3 rounded-xl font-body font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isPreparing
                            ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                            : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                        }`}
                      >
                        {updating === order.orderId ? "Updating..." : action.label}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.label || ""}
        message={
          confirmAction?.status === "preparing"
            ? "Start preparing this order?"
            : "Mark this order as ready for pickup?"
        }
        confirmLabel={confirmAction?.label || "Confirm"}
        variant={confirmAction?.status === "prepared" ? "warning" : "default"}
        onConfirm={() =>
          confirmAction && handleStatusChange(confirmAction.orderId, confirmAction.status)
        }
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
