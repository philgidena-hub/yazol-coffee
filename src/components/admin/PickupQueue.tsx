"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Order, UserRole } from "@/lib/types";
import { canTransitionStatus } from "@/lib/permissions";
import { useToast } from "./AdminToast";
import { useNotifications } from "@/hooks/useNotifications";
import ConfirmModal from "./ConfirmModal";

interface PickupQueueProps {
  onOrderUpdate: () => void;
  role: UserRole;
}

export default function PickupQueue({ onOrderUpdate, role }: PickupQueueProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);
  const { toast } = useToast();
  const { notify } = useNotifications();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.orders) {
        // Show only "prepared" orders — ready for customer pickup
        const prepared = (data.orders as Order[])
          .filter((o) => o.status === "prepared")
          .sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        setOrders(prepared);
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

  const handleComplete = async (orderId: string) => {
    setConfirmComplete(null);
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to complete order", "error");
        return;
      }

      toast("Order handed off to customer", "success");
      await fetchOrders();
      onOrderUpdate();
    } catch {
      toast("Failed to complete order", "error");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.orderId.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const canComplete = canTransitionStatus(role, "prepared", "completed");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-body font-semibold text-lg text-white">Pickup Counter</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-body font-medium tabular-nums">
              {orders.length} ready
            </span>
          </span>
        </div>

        {/* Search */}
        <div className="relative w-60">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/50 rounded-xl text-sm font-body text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/40 rounded-2xl border border-white/[0.06] animate-pulse h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-16 border border-white/[0.06] text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-slate-500 font-body text-sm">
            {orders.length === 0 ? "No orders ready for pickup" : "No matching orders"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((order) => {
              const isPaid =
                order.paymentMethod === "online" ||
                order.paymentStatus === "paid";

              return (
                <motion.div
                  key={order.orderId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="bg-emerald-500/5 backdrop-blur-sm rounded-2xl border border-emerald-500/20 overflow-hidden shadow-lg shadow-emerald-500/5"
                >
                  {/* Header with customer name prominent */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-body font-semibold text-xl text-white">
                          {order.customerName}
                        </p>
                        <p className="font-body text-[11px] text-slate-500 font-mono tracking-wide">
                          #{order.orderId.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold border bg-emerald-400/10 border-emerald-400/30 text-emerald-400">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold border bg-amber-400/10 border-amber-400/30 text-amber-400">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Collect ${order.total.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="px-4 py-3">
                    <div className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm font-body text-slate-300">
                          <span className="text-slate-500">{item.quantity}x</span> {item.name}
                        </p>
                      ))}
                    </div>
                    {order.specialInstructions && (
                      <p className="text-[11px] font-body text-slate-500 italic mt-2">
                        Note: {order.specialInstructions}
                      </p>
                    )}
                  </div>

                  {/* Total and action */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-body font-semibold tabular-nums">
                        ${order.total.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-body text-slate-500">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </div>
                    {canComplete && (
                      <button
                        onClick={() => setConfirmComplete(order.orderId)}
                        disabled={updating === order.orderId}
                        className="w-full py-3 bg-emerald-600 text-white font-body font-semibold text-sm rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                      >
                        {updating === order.orderId ? "Completing..." : "Hand Off to Customer"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirmComplete}
        title="Complete Order"
        message="Verify the order and hand off to the customer. This will mark the order as completed and move it to history."
        confirmLabel="Complete Handoff"
        variant="warning"
        onConfirm={() => confirmComplete && handleComplete(confirmComplete)}
        onCancel={() => setConfirmComplete(null)}
      />
    </div>
  );
}
