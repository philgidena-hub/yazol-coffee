"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Order, UserRole } from "@/lib/types";
import { getNextStatusActions, getAdminOverrideActions, canCancelOrder } from "@/lib/permissions";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; color: string; bg: string }
> = {
  pending:   { label: "Pending",   color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
  approved:  { label: "Approved",  color: "text-sky-400",     bg: "bg-sky-400/10 border-sky-400/30" },
  preparing: { label: "Preparing", color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30" },
  prepared:  { label: "Prepared",  color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  completed: { label: "Completed", color: "text-slate-500",   bg: "bg-slate-500/10 border-slate-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30" },
};

function getOrderAge(createdAt: string): { text: string; color: string } {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return { text: "Just now", color: "text-emerald-400" };
  if (diffMin < 5) return { text: `${diffMin}m ago`, color: "text-emerald-400" };
  if (diffMin < 15) return { text: `${diffMin}m ago`, color: "text-amber-400" };
  if (diffMin < 60) return { text: `${diffMin}m ago`, color: "text-red-400" };
  const diffHr = Math.floor(diffMin / 60);
  return { text: `${diffHr}h ago`, color: "text-red-400" };
}

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => Promise<boolean>;
  role: UserRole;
}

export default function OrderCard({ order, onStatusChange, role }: OrderCardProps) {
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdminActions, setShowAdminActions] = useState(false);
  const [overrideConfirm, setOverrideConfirm] = useState<{ status: Order["status"]; label: string; confirmMsg: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ timestamp: string; fromStatus: string; toStatus: string; username: string; userRole: string }>>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { toast } = useToast();
  const config = STATUS_CONFIG[order.status];
  const nextActions = getNextStatusActions(order.status, role);
  const next = nextActions.length > 0 ? nextActions[0] : null;
  const adminOverrides = getAdminOverrideActions(order.status, role);
  const showCancel = canCancelOrder(order.status, role);
  const isAdmin = role === "super_admin" || role === "admin";
  const showEmergencyCancel = isAdmin && order.status !== "pending" && order.status !== "completed" && order.status !== "cancelled";
  const age = useMemo(() => getOrderAge(order.createdAt), [order.createdAt]);

  const handleStatusChange = async () => {
    if (!next || updating) return;
    setShowConfirm(false);
    setUpdating(true);
    try {
      const success = await onStatusChange(order.orderId, next.status);
      if (success) {
        toast(`Order #${order.orderId.slice(0, 8)} → ${next.label}`, "success");
      }
    } catch {
      toast("Failed to update order status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (updating) return;
    setShowCancelConfirm(false);
    setUpdating(true);
    try {
      const success = await onStatusChange(order.orderId, "cancelled");
      if (success) {
        toast(`Order #${order.orderId.slice(0, 8)} cancelled`, "success");
      }
    } catch {
      toast("Failed to cancel order", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleOverride = async (targetStatus: Order["status"], label: string) => {
    if (updating) return;
    setOverrideConfirm(null);
    setUpdating(true);
    try {
      const success = await onStatusChange(order.orderId, targetStatus);
      if (success) {
        toast(`Order #${order.orderId.slice(0, 8)} → ${label}`, "success");
      }
    } catch {
      toast("Failed to update order status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const toggleHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    setShowHistory(true);
    if (auditLogs.length === 0) {
      setLoadingLogs(true);
      try {
        const res = await fetch(`/api/admin/orders/${order.orderId}/logs`);
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(data.logs || []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingLogs(false);
      }
    }
  };

  const pickupDate = new Date(order.pickupTime);
  const pickupStr = pickupDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasAllergyNotes = order.items.some((item) => item.allergyNotes);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-body text-[11px] text-slate-500 font-mono tracking-wide">
                #{order.orderId.slice(0, 8).toUpperCase()}
              </p>
              <span className={`text-[11px] font-body font-medium tabular-nums ${age.color}`}>
                {age.text}
              </span>
            </div>
            <p className="font-body font-medium text-base text-white mt-0.5">
              {order.customerName}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              {order.customerPhone && (
                <span className="text-[11px] font-body text-slate-500">
                  {order.customerPhone}
                </span>
              )}
              {order.customerEmail && (
                <span className="text-[11px] font-body text-slate-500">
                  {order.customerEmail}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.paymentMethod === "pay_at_pickup" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-body font-medium border bg-amber-400/10 border-amber-400/30 text-amber-400">
                Pay at Pickup
              </span>
            )}
            {order.paymentMethod === "online" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-body font-medium border bg-emerald-400/10 border-emerald-400/30 text-emerald-400">
                Paid Online
              </span>
            )}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-body font-medium border ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-3">
          {order.items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm font-body">
                <span className="text-slate-300">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-slate-500 tabular-nums">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              {item.allergyNotes && (
                <div className="flex items-center gap-1.5 mt-0.5 ml-4">
                  <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] font-body text-red-400">
                    {item.allergyNotes}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Allergy warning banner */}
        {hasAllergyNotes && (
          <div className="bg-red-950/30 border border-red-500/20 rounded-md px-3 py-1.5 mb-3">
            <span className="text-[11px] font-body font-medium text-red-400">
              Allergy notes present — review before preparing
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-body text-slate-500">
              Pickup {pickupStr}
            </span>
            <span className="text-white font-body font-semibold text-sm tabular-nums">
              ${order.total.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showCancel && order.status === "pending" && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={updating}
                className="px-3 py-1.5 bg-red-950 text-red-400 font-body text-xs font-medium rounded-md border border-red-500/20 hover:bg-red-900 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "..." : "Reject"}
              </button>
            )}
            {next && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={updating}
                className="px-3.5 py-1.5 bg-indigo-600 text-white font-body text-xs font-medium rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "..." : next.label}
              </button>
            )}
          </div>
        </div>

        {order.specialInstructions && (
          <p className="mt-2 text-xs font-body text-slate-500 italic border-t border-slate-800 pt-2">
            Note: {order.specialInstructions}
          </p>
        )}

        {/* Admin Override Actions */}
        {isAdmin && (adminOverrides.length > 0 || showEmergencyCancel) && order.status !== "completed" && order.status !== "cancelled" && (
          <div className="mt-2 border-t border-slate-800 pt-2">
            <button
              onClick={() => setShowAdminActions(!showAdminActions)}
              className="text-[11px] font-body text-amber-500/70 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showAdminActions ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Admin Actions
            </button>
            {showAdminActions && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {adminOverrides.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => setOverrideConfirm(action)}
                    disabled={updating}
                    className="px-2.5 py-1 text-[10px] font-body font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action.label}
                  </button>
                ))}
                {showEmergencyCancel && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={updating}
                    className="px-2.5 py-1 text-[10px] font-body font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Emergency Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Toggle */}
        <div className="mt-2 border-t border-slate-800 pt-2">
          <button
            onClick={toggleHistory}
            className="text-[11px] font-body text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showHistory ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Status History
          </button>
          {showHistory && (
            <div className="mt-2 ml-1 pl-3 border-l border-slate-800 space-y-1.5">
              {loadingLogs ? (
                <p className="text-[10px] font-body text-slate-600">Loading...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-[10px] font-body text-slate-600">No history recorded yet</p>
              ) : (
                auditLogs.map((log, i) => (
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
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {next && (
        <ConfirmModal
          open={showConfirm}
          title={`${next.label} Order`}
          message={next.confirmMsg}
          confirmLabel={next.label}
          variant={next.status === "completed" ? "warning" : "default"}
          onConfirm={handleStatusChange}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        open={showCancelConfirm}
        title={showEmergencyCancel ? "Emergency Cancel" : "Reject Order"}
        message={
          showEmergencyCancel
            ? `Emergency cancel order #${order.orderId.slice(0, 8).toUpperCase()} in "${order.status}" status? This action cannot be undone.`
            : `Are you sure you want to reject order #${order.orderId.slice(0, 8).toUpperCase()}? This action cannot be undone.`
        }
        confirmLabel={showEmergencyCancel ? "Emergency Cancel" : "Reject Order"}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />

      {/* Admin Override Confirmation Modal */}
      <ConfirmModal
        open={!!overrideConfirm}
        title="Admin Override"
        message={overrideConfirm?.confirmMsg || ""}
        confirmLabel={overrideConfirm?.label || "Confirm"}
        variant="warning"
        onConfirm={() => overrideConfirm && handleOverride(overrideConfirm.status, overrideConfirm.label)}
        onCancel={() => setOverrideConfirm(null)}
      />
    </>
  );
}
