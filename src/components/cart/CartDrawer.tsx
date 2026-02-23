"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import CartItemRow from "./CartItem";
import CartSummary from "./CartSummary";
import Link from "next/link";

export default function CartDrawer() {
  const { state, closeCart, itemCount } = useCart();

  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [state.isOpen]);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9995]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-black/5 z-[9996] flex flex-col shadow-soft-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, type: "spring", damping: 20 }}
                className="font-display text-brown text-xl"
              >
                Your Order{" "}
                {itemCount > 0 && (
                  <span className="text-brown/50 text-base">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </motion.h2>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-9 h-9 rounded-full bg-surface-light flex items-center justify-center text-brown/50 hover:text-brown transition-colors"
                aria-label="Close cart"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            </div>

            {/* Body */}
            {state.items.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  <AnimatePresence mode="popLayout">
                    {state.items.map((item, i) => (
                      <motion.div
                        key={item.menuItem.slug}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{
                          delay: i * 0.05,
                          type: "spring",
                          damping: 25,
                          stiffness: 200,
                        }}
                        layout
                      >
                        <CartItemRow item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 20 }}
                  className="px-6 pb-6"
                >
                  <CartSummary />
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", damping: 20 }}
                className="flex-1 flex flex-col items-center justify-center px-6 text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl mb-4 opacity-20"
                >
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brown">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </motion.div>
                <p className="text-brown/50 font-body mb-6">
                  Your cart is empty
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/menu"
                    onClick={closeCart}
                    className="px-6 py-2.5 border border-brown text-brown rounded-full text-sm font-display hover:bg-brown hover:text-white transition-colors"
                  >
                    Browse Menu
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
