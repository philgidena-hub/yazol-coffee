"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { getProductImage } from "@/lib/image-map";
import { placeOrder } from "./actions";
import TimeSlotPicker from "@/components/checkout/TimeSlotPicker";

export default function CheckoutPage() {
  const { state, subtotal, tax, total, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pickupTime: "",
    instructions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirm, setOrderConfirm] = useState<{
    orderId: string;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.items.length === 0) return;

    if (!form.pickupTime) {
      setError("Please select a pickup time");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await placeOrder({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        pickupTime: form.pickupTime,
        specialInstructions: form.instructions,
        items: state.items.map((i) => ({
          slug: i.menuItem.slug,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
          allergyNotes: i.allergyNotes,
        })),
      });

      if (!result.success) throw new Error(result.error || "Failed to place order");

      setOrderConfirm({ orderId: result.orderId!, total: result.total! });
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Order confirmed
  if (orderConfirm) {
    return (
      <main className="min-h-screen bg-bg pt-32 pb-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-cream mb-3">
              Order Confirmed!
            </h1>
            <p className="text-cream-muted font-body mb-2">
              Order #{orderConfirm.orderId.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-gold font-display text-2xl mb-6">
              Total: ${orderConfirm.total.toFixed(2)}
            </p>
            <p className="text-cream-muted font-body text-sm mb-8 max-w-sm mx-auto">
              We&apos;ll have your order ready for pickup. You&apos;ll receive a confirmation at {form.email || "your email"}.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3.5 bg-gold text-bg font-display text-sm rounded-full hover:bg-gold-light transition-colors"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  // Empty cart
  if (state.items.length === 0 && !orderConfirm) {
    return (
      <main className="min-h-screen bg-bg pt-32 pb-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h1 className="font-display text-3xl text-cream mb-4">Checkout</h1>
          <p className="text-cream-muted font-body mb-8">
            Your cart is empty. Add some items before checking out.
          </p>
          <Link
            href="/menu"
            className="inline-block px-8 py-3.5 border border-gold text-gold font-display text-sm rounded-full hover:bg-gold hover:text-bg transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl md:text-4xl text-cream mb-12"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-6"
          >
            <div>
              <label className="block text-cream-muted text-sm font-body mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface border border-cream/10 rounded-xl px-4 py-3 text-cream font-body text-sm focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-cream-muted text-sm font-body mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-surface border border-cream/10 rounded-xl px-4 py-3 text-cream font-body text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="(416) 000-0000"
                />
              </div>
              <div>
                <label className="block text-cream-muted text-sm font-body mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-surface border border-cream/10 rounded-xl px-4 py-3 text-cream font-body text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-cream-muted text-sm font-body mb-2">
                Pickup Time *
              </label>
              <TimeSlotPicker
                value={form.pickupTime}
                onChange={(value) => setForm({ ...form, pickupTime: value })}
              />
            </div>

            <div>
              <label className="block text-cream-muted text-sm font-body mb-2">
                Special Instructions
              </label>
              <textarea
                value={form.instructions}
                onChange={(e) =>
                  setForm({ ...form, instructions: e.target.value })
                }
                rows={3}
                className="w-full bg-surface border border-cream/10 rounded-xl px-4 py-3 text-cream font-body text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none"
                placeholder="Any additional requests..."
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gold text-bg font-display text-base rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
            </button>
          </motion.form>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-surface rounded-2xl p-6 sticky top-24">
              <h2 className="font-display text-lg text-cream mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {state.items.map((item) => (
                  <div key={item.menuItem.slug} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={getProductImage(item.menuItem.slug)}
                        alt={item.menuItem.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-body truncate">
                        {item.menuItem.name}
                      </p>
                      <p className="text-cream-muted text-xs">
                        x{item.quantity}
                      </p>
                      {item.allergyNotes && (
                        <p className="text-cream-muted text-xs italic truncate">
                          {item.allergyNotes}
                        </p>
                      )}
                    </div>
                    <p className="text-cream text-sm font-body">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-cream/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-cream-muted">Subtotal</span>
                  <span className="text-cream">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-cream-muted">HST (13%)</span>
                  <span className="text-cream">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-display pt-2 border-t border-cream/10">
                  <span className="text-cream">Total</span>
                  <span className="text-gold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
