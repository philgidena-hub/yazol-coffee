"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem, CartItem } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";
import ItemCustomizer from "./ItemCustomizer";

interface MenuCardProps {
  item: MenuItem;
  theme?: "coffee" | "ice-cream";
}

export default function MenuCard({ item, theme = "coffee" }: MenuCardProps) {
  const { addItem, addCustomItem, openCart } = useCart();
  const toast = useToast();
  const imageSrc = getProductImage(item.slug, item.imageKey);
  const soldOut = !item.isAvailable;
  const hasCustomization =
    (item.sizes && item.sizes.length > 0) ||
    (item.optionGroups && item.optionGroups.length > 0);

  const [customizerOpen, setCustomizerOpen] = useState(false);

  const handleAdd = () => {
    if (soldOut) return;
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

  const priceDisplay = item.sizes && item.sizes.length > 0
    ? `$${Math.min(...item.sizes.map((s) => s.price)).toFixed(2)}`
    : `$${item.price.toFixed(2)}`;

  const isCoffee = theme === "coffee";

  return (
    <>
      <div
        className={`group relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${
          isCoffee
            ? "bg-[#2a1f12] border border-amber-900/20"
            : "bg-white/70 backdrop-blur-sm border border-pink-300/20"
        } ${
          soldOut
            ? "opacity-60"
            : isCoffee
              ? "hover:border-amber-700/40 hover:shadow-[0_8px_30px_rgba(212,165,116,0.15)]"
              : "hover:border-pink-300/40 hover:shadow-[0_8px_30px_rgba(236,72,153,0.1)]"
        }`}
      >
        {/* Availability Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md backdrop-blur-sm ${
              soldOut
                ? isCoffee ? "bg-red-900/40 text-red-300" : "bg-red-50 text-red-500"
                : isCoffee
                  ? "bg-amber-900/40 text-amber-300"
                  : "bg-green-50/80 text-green-600"
            }`}
          >
            {soldOut ? "Sold Out" : "Available"}
          </span>
        </div>

        {/* Image area */}
        <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center ${
              soldOut ? "grayscale" : ""
            }`}
          />

          {/* Add button */}
          {!soldOut && (
            <button
              onClick={handleAdd}
              className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-10 h-10 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 hover:scale-105 z-10 touch-target ${
                isCoffee
                  ? "bg-amber-600 hover:bg-amber-500"
                  : "bg-pink-500 hover:bg-pink-600"
              }`}
              aria-label={hasCustomization ? `Customize ${item.name}` : `Add ${item.name} to cart`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Details */}
        <div className="p-3 sm:p-4">
          <h3 className={`font-display text-sm sm:text-base leading-tight mb-0.5 line-clamp-1 ${
            isCoffee ? "text-amber-100" : "text-gray-800"
          }`}>
            {item.name}
          </h3>
          <p className={`text-xs sm:text-sm leading-snug mb-2 line-clamp-2 font-body ${
            isCoffee ? "text-amber-200/45" : "text-gray-500"
          }`}>
            {item.description}
          </p>
          <p className={`font-display text-sm sm:text-base font-semibold ${
            isCoffee ? "text-amber-300" : "text-pink-600"
          }`}>
            {priceDisplay}
          </p>
        </div>
      </div>

      {/* Customizer Modal */}
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
