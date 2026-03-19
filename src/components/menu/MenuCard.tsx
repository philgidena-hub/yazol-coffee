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
}

export default function MenuCard({ item }: MenuCardProps) {
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

  return (
    <>
      <div
        className={`group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-black/5 transition-shadow duration-300 ${
          soldOut ? "opacity-60" : "hover:shadow-card-hover"
        }`}
      >
        {/* Availability Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md ${
              soldOut
                ? "bg-red-50 text-red-500"
                : "bg-green-50 text-green-600"
            }`}
          >
            {soldOut ? "Sold Out" : "Available"}
          </span>
        </div>

        {/* Image area */}
        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover ${
              soldOut ? "grayscale" : ""
            }`}
          />

          {/* Add button */}
          {!soldOut && (
            <button
              onClick={handleAdd}
              className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 hover:scale-105 z-10"
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
          <h3 className="font-display text-sm sm:text-base text-brown leading-tight mb-0.5 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-brown/45 text-xs sm:text-sm leading-snug mb-2 line-clamp-2 font-body">
            {item.description}
          </p>
          <p className="text-green-600 font-display text-sm sm:text-base font-semibold">
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
