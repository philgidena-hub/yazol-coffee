"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import type { Order } from "@/lib/types";
import OrderCard from "./OrderCard";
import OrderFilters from "./OrderFilters";
import { useToast } from "./AdminToast";
import { useNotifications } from "@/hooks/useNotifications";

const STATUS_PRIORITY: Record<Order["status"], number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
};

interface LiveOrdersProps {
  onOrderUpdate: () => void;
}

export default function LiveOrders({ onOrderUpdate }: LiveOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);
  const { toast } = useToast();
  const { notify, isMuted, toggleMute } = useNotifications();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.orders) {
        const sorted = data.orders.sort(
          (a: Order, b: Order) =>
            STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Check for new pending orders (only after first fetch)
        if (!isFirstFetchRef.current) {
          const currentIds = previousOrderIdsRef.current;
          const newPending = sorted.filter(
            (o: Order) => o.status === "pending" && !currentIds.has(o.orderId)
          );
          for (const order of newPending) {
            notify("New Order", `Order from ${order.customerName}`);
          }
        }
        isFirstFetchRef.current = false;

        // Update tracked order IDs
        previousOrderIdsRef.current = new Set(sorted.map((o: Order) => o.orderId));
        setOrders(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (!isFirstFetchRef.current) {
        toast("Failed to fetch orders", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [notify, toast]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]): Promise<boolean> => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to update status", "error");
      return false;
    }

    await fetchOrders();
    onOrderUpdate();
    return true;
  };

  // Status counts (from unfiltered orders)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, statusFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-body font-semibold text-lg text-white">Live Orders</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-body font-medium tabular-nums">
              {orders.length}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute notifications" : "Mute notifications"}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Manual refresh */}
          <button
            onClick={fetchOrders}
            title="Refresh orders"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-32"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-900 rounded-xl p-10 border border-slate-800 text-center">
          <div className="text-slate-600 text-3xl mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-slate-500 font-body text-sm">
            {orders.length === 0 ? "No active orders" : "No orders match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
