"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface OrderData {
  orderId: string;
  customerName: string;
  items: Array<{ slug: string; name: string; price: number; quantity: number; allergyNotes: string }>;
  subtotal: number;
  tax: number;
  total: number;
  pickupTime: string;
  status: "pending" | "approved" | "preparing" | "prepared" | "completed" | "cancelled";
  paymentMethod?: "online" | "pay_at_pickup";
  createdAt: string;
  updatedAt: string;
}

const STEPS = [
  { status: "pending",   label: "Order Placed" },
  { status: "approved",  label: "Approved" },
  { status: "preparing", label: "Preparing" },
  { status: "prepared",  label: "Ready for Pickup" },
  { status: "completed", label: "Completed" },
] as const;

const STATUS_MESSAGES: Record<OrderData["status"], string> = {
  pending:   "Your order has been placed and is awaiting approval.",
  approved:  "Your order has been approved and will be prepared soon.",
  preparing: "Your order is being prepared right now!",
  prepared:  "Your order is ready for pickup!",
  completed: "Your order has been picked up. Thank you!",
  cancelled: "This order has been cancelled.",
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Order not found");
        } else {
          setError("Failed to load order");
        }
        return;
      }
      const data = await res.json();
      setOrder(data);
      setError("");
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5_000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg pt-32 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-brown/10 rounded-lg w-48 mx-auto" />
            <div className="h-4 bg-brown/10 rounded-lg w-64 mx-auto" />
            <div className="h-24 bg-brown/10 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-bg pt-32 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-6 text-center">
          <h1 className="font-display text-3xl text-brown mb-4">
            {error || "Order not found"}
          </h1>
          <Link
            href="/menu"
            className="inline-block px-8 py-3.5 border border-brown text-brown font-display text-sm rounded-full hover:bg-brown hover:text-white transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const pickupStr = new Date(order.pickupTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-bg pt-32 pb-20">
      <div className="max-w-xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-gold/60 text-xs tracking-[0.15em] uppercase font-body mb-2">
              Order Tracking
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-brown mb-2">
              #{order.orderId.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-brown/50 font-body text-sm">
              {order.customerName}
            </p>
          </div>

          {/* Status Message */}
          <div
            className={`text-center rounded-2xl p-6 mb-8 border ${
              isCancelled
                ? "bg-red-50 border-red-200"
                : "bg-white border-black/5"
            }`}
          >
            {isCancelled ? (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : order.status === "completed" ? (
              <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <p className={`font-body text-sm ${isCancelled ? "text-red-600" : "text-brown/70"}`}>
              {STATUS_MESSAGES[order.status]}
            </p>
          </div>

          {/* Progress Steps */}
          {!isCancelled && (
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-black/5" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-gold transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100)}%`,
                  }}
                />

                {STEPS.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step.status} className="relative flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isActive
                            ? "bg-gold border-gold text-white"
                            : "bg-white border-black/10 text-brown/30"
                        } ${isCurrent ? "ring-4 ring-gold/20" : ""}`}
                      >
                        {isActive ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-xs font-body">{i + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[10px] font-body text-center ${
                          isActive ? "text-brown font-medium" : "text-brown/30"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-2xl p-6 border border-black/5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg text-brown">Order Details</h2>
              <div className="flex items-center gap-2 text-xs font-body text-brown/50">
                <span>Pickup {pickupStr}</span>
                {order.paymentMethod && (
                  <span className={`px-2 py-0.5 rounded-full border ${
                    order.paymentMethod === "online"
                      ? "bg-green/5 border-green/20 text-green"
                      : "bg-gold/5 border-gold/20 text-gold"
                  }`}>
                    {order.paymentMethod === "online" ? "Paid" : "Pay at Pickup"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-body">
                  <span className="text-brown/70">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-brown tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/5 pt-3 space-y-1">
              <div className="flex justify-between text-sm font-body">
                <span className="text-brown/50">Subtotal</span>
                <span className="text-brown">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-brown/50">HST (13%)</span>
                <span className="text-brown">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-display pt-2 border-t border-black/5">
                <span className="text-brown">Total</span>
                <span className="text-gold">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link
              href="/menu"
              className="inline-block px-8 py-3.5 border border-brown text-brown font-display text-sm rounded-full hover:bg-brown hover:text-white transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
