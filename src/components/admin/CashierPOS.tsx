"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem } from "@/lib/dynamodb";
import { useToast } from "./AdminToast";

interface POSItem {
  menuItem: MenuItem;
  quantity: number;
  allergyNotes: string;
}

interface CustomerSuggestion {
  name: string;
  phone: string;
  email: string;
  orderCount: number;
}

type PaymentMethod = "cash" | "card" | "pay_at_pickup";

interface CashierPOSProps {
  onOrderCreated: () => void;
}

export default function CashierPOS({ onOrderCreated }: CashierPOSProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    orderId: string;
    items: POSItem[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentMethod: PaymentMethod;
    createdAt: string;
  } | null>(null);

  // Customer lookup
  const [customerQuery, setCustomerQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { toast } = useToast();

  // Fetch menu
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMenuItems(data.items || []);
    } catch {
      toast("Failed to load menu", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Customer search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (customerQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/customers/search?q=${encodeURIComponent(customerQuery.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.customers || []);
          setShowSuggestions(true);
        }
      } catch {
        // silent
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [customerQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectCustomer = (c: CustomerSuggestion) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerEmail(c.email);
    setCustomerQuery(c.name);
    setShowSuggestions(false);
  };

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((i) => i.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems.filter((i) => i.isAvailable);
    if (categoryFilter !== "all") {
      items = items.filter((i) => i.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, categoryFilter, search]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.menuItem.slug === item.slug);
      if (existing) {
        return prev.map((p) =>
          p.menuItem.slug === item.slug
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { menuItem: item, quantity: 1, allergyNotes: "" }];
    });
  };

  const updateQuantity = (slug: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((p) => p.menuItem.slug !== slug));
    } else {
      setCart((prev) =>
        prev.map((p) =>
          p.menuItem.slug === slug ? { ...p, quantity: qty } : p
        )
      );
    }
  };

  const updateAllergyNotes = (slug: string, notes: string) => {
    setCart((prev) =>
      prev.map((p) =>
        p.menuItem.slug === slug ? { ...p, allergyNotes: notes } : p
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.13 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const resetForm = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerQuery("");
    setSpecialInstructions("");
    setPaymentMethod("cash");
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast("Customer name is required", "error");
      return;
    }
    if (cart.length === 0) {
      toast("Add at least one item", "error");
      return;
    }

    setSubmitting(true);
    try {
      const pickupTime = new Date(Date.now() + 15 * 60_000).toISOString();
      const now = new Date().toISOString();

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || "Walk-in",
          customerEmail: customerEmail.trim() || "walkin@store.local",
          items: cart.map((c) => ({
            slug: c.menuItem.slug,
            name: c.menuItem.name,
            price: c.menuItem.price,
            quantity: c.quantity,
            allergyNotes: c.allergyNotes,
          })),
          pickupTime,
          specialInstructions: specialInstructions.trim(),
          paymentMethod: paymentMethod === "card" ? "online" : "pay_at_pickup",
          ...(paymentMethod === "cash" && { paymentStatus: "paid" }),
          ...(paymentMethod === "card" && { paymentStatus: "paid" }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create order");
      }

      const data = await res.json();

      // Show receipt
      setReceipt({
        orderId: data.orderId,
        items: [...cart],
        subtotal,
        tax,
        total,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || "Walk-in",
        customerEmail: customerEmail.trim() || "—",
        paymentMethod,
        createdAt: now,
      });

      resetForm();
      onOrderCreated();
      toast("Order created successfully!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Receipt modal
  if (receipt) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6"
        >
          {/* Receipt header */}
          <div className="text-center mb-5 pb-4 border-b border-dashed border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-white mb-1">Order Created</h2>
            <p className="text-slate-500 text-xs font-body font-mono">
              #{receipt.orderId.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-slate-600 text-[10px] font-body mt-1">
              {new Date(receipt.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Customer info */}
          <div className="mb-4 pb-3 border-b border-slate-800/50">
            <p className="text-sm font-body text-white">{receipt.customerName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {receipt.customerPhone !== "Walk-in" && (
                <span className="text-[11px] font-body text-slate-500">{receipt.customerPhone}</span>
              )}
              {receipt.customerEmail !== "—" && receipt.customerEmail !== "walkin@store.local" && (
                <span className="text-[11px] font-body text-slate-500">{receipt.customerEmail}</span>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5 mb-4">
            {receipt.items.map((item) => (
              <div key={item.menuItem.slug} className="flex justify-between text-sm font-body">
                <span className="text-slate-300">
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="text-slate-400 tabular-nums">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-slate-800/50 pt-3 mb-4 space-y-1">
            <div className="flex justify-between text-xs font-body text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums">${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-body text-slate-500">
              <span>Tax (13%)</span>
              <span className="tabular-nums">${receipt.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-body font-semibold text-white pt-1">
              <span>Total</span>
              <span className="tabular-nums">${receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment badge */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium border ${
              receipt.paymentMethod === "cash"
                ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                : receipt.paymentMethod === "card"
                ? "bg-sky-400/10 border-sky-400/30 text-sky-400"
                : "bg-amber-400/10 border-amber-400/30 text-amber-400"
            }`}>
              {receipt.paymentMethod === "cash" && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
              {receipt.paymentMethod === "card" && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
              {receipt.paymentMethod === "pay_at_pickup" && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {receipt.paymentMethod === "cash"
                ? "Paid — Cash"
                : receipt.paymentMethod === "card"
                ? "Paid — Card"
                : "Pay at Pickup"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setReceipt(null)}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-body font-semibold text-sm rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              New Order
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Menu items */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-body font-semibold text-lg text-white">New Order</h2>
          <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-2 py-0.5">
            POS
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/50 rounded-xl text-sm font-body text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
              categoryFilter === "all"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-300 hover:bg-slate-800 border border-slate-700/50"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-300 hover:bg-slate-800 border border-slate-700/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-24" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-10 border border-slate-800/50 text-center">
            <p className="text-slate-500 font-body text-sm">No items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c.menuItem.slug === item.slug);
              return (
                <motion.button
                  key={item.slug}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(item)}
                  className={`relative text-left p-3.5 rounded-xl border transition-all group ${
                    inCart
                      ? "bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                      : "bg-slate-900/60 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                      {inCart.quantity}
                    </span>
                  )}
                  <p className="text-sm font-body font-medium text-white truncate mb-1">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body text-slate-500">{item.category}</span>
                    <span className="text-sm font-body font-semibold text-emerald-400 tabular-nums">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Cart & Customer Details */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-4">
          {/* Customer Details */}
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-body font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Details
            </h3>
            <div className="space-y-2.5">
              {/* Customer lookup field */}
              <div className="relative" ref={suggestionsRef}>
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search returning customer..."
                  value={customerQuery}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    // Also update name if they're typing fresh
                    if (!suggestions.some((s) => s.name === e.target.value)) {
                      setCustomerName(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
                {loadingSuggestions && (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 top-full mt-1 left-0 right-0 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden"
                    >
                      {suggestions.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => selectCustomer(c)}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-body text-white">{c.name}</p>
                            {c.orderCount > 0 && (
                              <span className="text-[9px] font-body text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                {c.orderCount} order{c.orderCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {c.phone && (
                              <span className="text-[10px] font-body text-slate-500">{c.phone}</span>
                            )}
                            {c.email && (
                              <span className="text-[10px] font-body text-slate-500">{c.email}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                placeholder="Customer name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <textarea
                placeholder="Special instructions..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={2}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-body font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payment
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: "cash" as const, label: "Cash", icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )},
                { key: "card" as const, label: "Card", icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )},
                { key: "pay_at_pickup" as const, label: "Later", icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
              ]).map((pm) => (
                <button
                  key={pm.key}
                  onClick={() => setPaymentMethod(pm.key)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-body font-medium transition-all ${
                    paymentMethod === pm.key
                      ? pm.key === "cash"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5"
                        : pm.key === "card"
                        ? "bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-500/5"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5"
                      : "bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  {pm.icon}
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-body font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Order Items
              {cart.length > 0 && (
                <span className="text-indigo-400 text-[11px] font-medium bg-indigo-500/10 px-1.5 py-0.5 rounded">
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              )}
            </h3>

            {cart.length === 0 ? (
              <p className="text-slate-600 text-xs font-body text-center py-6">
                Tap menu items to add them
              </p>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.menuItem.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-body text-white truncate flex-1 mr-2">
                          {item.menuItem.name}
                        </span>
                        <span className="text-sm font-body font-medium text-slate-300 tabular-nums">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.menuItem.slug, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-slate-700/60 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-sm font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-sm font-body font-medium text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.slug, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-slate-700/60 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-sm font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.menuItem.slug, 0)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {/* Allergy notes input */}
                      <input
                        type="text"
                        placeholder="Allergy notes..."
                        value={item.allergyNotes}
                        onChange={(e) => updateAllergyNotes(item.menuItem.slug, e.target.value)}
                        className="w-full mt-1.5 bg-slate-900/50 border border-slate-700/30 rounded px-2 py-1 text-[11px] text-slate-400 font-body placeholder:text-slate-700 focus:outline-none focus:border-red-500/30 transition-colors"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <div className="border-t border-slate-700/50 mt-3 pt-3 space-y-1">
                <div className="flex justify-between text-xs font-body text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-body text-slate-500">
                  <span>Tax (13%)</span>
                  <span className="tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-body font-semibold text-white pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-body font-semibold text-sm rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 disabled:shadow-none"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Order...
              </span>
            ) : (
              `Place Order${total > 0 ? ` — $${total.toFixed(2)}` : ""}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
