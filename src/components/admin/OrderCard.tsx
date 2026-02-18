"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Order, UserRole } from "@/lib/types";
import { getNextStatusActions } from "@/lib/permissions";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  confirmed: { label: "Confirmed", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/30" },
  preparing: { label: "Preparing", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
  ready: { label: "Ready", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  completed: { label: "Completed", color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/30" },
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
  const { toast } = useToast();
  const config = STATUS_CONFIG[order.status];
  const nextActions = getNextStatusActions(order.status, role);
  const next = nextActions.length > 0 ? nextActions[0] : null;
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
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-body font-medium border ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
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

        {order.specialInstructions && (
          <p className="mt-2 text-xs font-body text-slate-500 italic border-t border-slate-800 pt-2">
            Note: {order.specialInstructions}
          </p>
        )}
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
    </>
  );
}
