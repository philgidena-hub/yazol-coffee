"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { MenuItem, CartItem } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";
import ItemCustomizer from "@/components/menu/ItemCustomizer";

interface ProductCardProps {
  item: MenuItem;
  index?: number;
}

export default function ProductCard({
  item,
  index = 0,
}: ProductCardProps) {
  const { addItem, addCustomItem, openCart } = useCart();
  const toast = useToast();
  const imageSrc = getProductImage(item.slug, item.imageKey);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const hasCustomization =
    (item.sizes && item.sizes.length > 0) ||
    (item.optionGroups && item.optionGroups.length > 0);

  const priceDisplay = item.sizes && item.sizes.length > 0
    ? `From $${Math.min(...item.sizes.map((s) => s.price)).toFixed(2)}`
    : `$${item.price.toFixed(2)}`;

  const handleAdd = () => {
    if (hasCustomization) {
      setCustomizerOpen(true);
      return;
    }
    addItem(item);
    toast.show(`Added ${item.name} to cart`, {
      label: "View Cart",
      onClick: openCart,
    });
  };

  const handleCustomAdd = (cartItem: CartItem) => {
    addCustomItem(cartItem);
    toast.show(`Added ${item.name} to cart`, {
      label: "View Cart",
      onClick: openCart,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 80,
          delay: index * 0.06,
        }}
        className="group"
        whileHover={{ y: -6 }}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-xl aspect-[4/5] mb-3 bg-surface-light">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Customize badge */}
          {hasCustomization && (
            <div className="absolute top-2 right-2 bg-gold/90 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Customize
            </div>
          )}

          {/* Add to cart */}
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-brown text-white rounded-full flex items-center justify-center shadow-soft-md md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-brown-light"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.button>
        </div>

        {/* Content below image */}
        <div className="px-0.5">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="font-display text-brown text-sm md:text-base leading-snug">
              {item.name}
            </h3>
            <span className="text-gold font-display text-sm flex-shrink-0">
              {priceDisplay}
            </span>
          </div>
          <p className="text-brown/50 text-xs leading-relaxed line-clamp-1">
            {item.description}
          </p>
        </div>
      </motion.div>

      {hasCustomization && (
        <ItemCustomizer
          item={item}
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          onAddToCart={handleCustomAdd}
        />
      )}
    </>
  );
}
