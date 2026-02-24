"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/lib/types";

interface AuditLog {
  timestamp: string;
  fromStatus: string;
  toStatus: string;
  username: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<Record<string, AuditLog[]>>({});
  const [loadingLogs, setLoadingLogs] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/admin/orders/history?limit=50");
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch order history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const fetchAuditLogs = useCallback(async (orderId: string) => {
    if (auditLogs[orderId]) return;
    setLoadingLogs(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs((prev) => ({ ...prev, [orderId]: data.logs || [] }));
      }
    } catch {
      // ignore
    } finally {
      setLoadingLogs(null);
    }
  }, [auditLogs]);

  const handleExpand = (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
    } else {
      setExpandedId(orderId);
      fetchAuditLogs(orderId);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-body font-semibold text-lg text-white">Order History</h2>
        <span className="text-slate-500 text-xs font-body">
          {orders.length} past order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-48" />
      ) : orders.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <p className="text-slate-500 text-sm">No past orders yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const isExpanded = expandedId === order.orderId;
            return (
              <div
                key={order.orderId}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
              >
                {/* Summary row */}
                <button
                  onClick={() => handleExpand(order.orderId)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {order.status === "cancelled" ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-body text-slate-200 truncate">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] font-body text-slate-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-body font-medium text-slate-300 tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} item{order.items.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? "s" : ""}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-800 px-4 py-3 bg-slate-950/50">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3 text-xs font-body">
                      <div>
                        <span className="text-slate-600">Order ID: </span>
                        <span className="text-slate-400">{order.orderId}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Phone: </span>
                        <span className="text-slate-400">{order.customerPhone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Email: </span>
                        <span className="text-slate-400">{order.customerEmail || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Pickup: </span>
                        <span className="text-slate-400">{order.pickupTime || "ASAP"}</span>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <p className="text-xs font-body text-amber-400/80 mb-3">
                        Note: {order.specialInstructions}
                      </p>
                    )}

                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs font-body"
                        >
                          <span className="text-slate-400">
                            {item.quantity}x {item.name}
                            {item.allergyNotes && (
                              <span className="ml-1 text-red-400/70">({item.allergyNotes})</span>
                            )}
                          </span>
                          <span className="text-slate-500 tabular-nums">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-800 mt-2 pt-2 flex justify-between text-xs font-body">
                      <span className="text-slate-500">Total</span>
                      <span className="text-slate-300 font-medium tabular-nums">${order.total.toFixed(2)}</span>
                    </div>

                    {/* Audit Trail */}
                    <div className="border-t border-slate-800 mt-2 pt-2">
                      <p className="text-[10px] font-body text-slate-600 uppercase tracking-wider mb-1.5">
                        Status History
                      </p>
                      {loadingLogs === order.orderId ? (
                        <p className="text-[10px] font-body text-slate-600">Loading...</p>
                      ) : !auditLogs[order.orderId] || auditLogs[order.orderId].length === 0 ? (
                        <p className="text-[10px] font-body text-slate-600">No history recorded</p>
                      ) : (
                        <div className="ml-1 pl-2 border-l border-slate-800 space-y-1">
                          {auditLogs[order.orderId].map((log, i) => (
                            <div key={i} className="text-[10px] font-body text-slate-500">
                              <span className="text-slate-600 tabular-nums">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {" "}
                              <span className="text-slate-400">{log.fromStatus}</span>
                              {" → "}
                              <span className="text-slate-300">{log.toStatus}</span>
                              {" by "}
                              <span className="text-slate-400">{log.username}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
