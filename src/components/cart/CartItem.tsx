"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem as CartItemType } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { useCart } from "@/lib/cart-context";
import QuantitySelector from "@/components/ui/QuantitySelector";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, updateAllergyNotes, removeItem } = useCart();
  const [showNotes, setShowNotes] = useState(false);
  const imageSrc = getProductImage(item.menuItem.slug);
  const lineTotal = item.menuItem.price * item.quantity;

  return (
    <div className="flex gap-3 py-4 border-b border-black/5">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={imageSrc}
          alt={item.menuItem.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display text-brown text-sm leading-tight truncate">
            {item.menuItem.name}
          </h4>
          <button
            onClick={() => removeItem(item.menuItem.slug)}
            className="text-brown/50 hover:text-brown text-xs flex-shrink-0 transition-colors"
            aria-label={`Remove ${item.menuItem.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            quantity={item.quantity}
            onChange={(q) => updateQuantity(item.menuItem.slug, q)}
          />
          <span className="text-gold font-display text-sm">
            ${lineTotal.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-brown/50 text-xs font-body hover:text-gold transition-colors mt-1.5"
        >
          {item.allergyNotes ? "Edit allergy notes" : "Add allergy notes"}
        </button>

        {!showNotes && item.allergyNotes && (
          <p className="text-brown/50 text-xs font-body mt-1 truncate italic">
            {item.allergyNotes}
          </p>
        )}

        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                value={item.allergyNotes}
                onChange={(e) => updateAllergyNotes(item.menuItem.slug, e.target.value)}
                placeholder="e.g., nut allergy, dairy-free..."
                rows={2}
                maxLength={200}
                className="w-full bg-surface-light border border-black/5 rounded-xl px-3 py-2 text-brown font-body text-xs focus:outline-none focus:border-gold/50 transition-colors resize-none mt-2"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
