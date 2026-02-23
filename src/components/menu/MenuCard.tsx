"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";

interface MenuCardProps {
  item: MenuItem;
  index?: number;
}

export default function MenuCard({ item, index = 0 }: MenuCardProps) {
  const { addItem, openCart } = useCart();
  const toast = useToast();
  const imageSrc = getProductImage(item.slug);
  const soldOut = !item.isAvailable;

  const handleAdd = () => {
    if (soldOut) return;
    addItem(item);
    toast.show(`Added ${item.name} to cart`, {
      label: "View Cart",
      onClick: openCart,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 80,
        delay: Math.min(index * 0.05, 0.3),
      }}
      className="group"
    >
      <motion.div
        whileHover={soldOut ? {} : { y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative bg-white rounded-2xl overflow-hidden border border-black/5 transition-all duration-500 ${
          soldOut
            ? "opacity-50"
            : "hover:shadow-card-hover"
        }`}
      >
        {/* Sold Out Badge */}
        {soldOut && (
          <div className="absolute top-4 right-4 z-20 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Sold Out
          </div>
        )}

        {/* Item Image */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-out ${
              soldOut ? "grayscale" : "group-hover:scale-105"
            }`}
          />

          {/* Price badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 border border-black/5">
            <span className="text-gold font-display text-sm">${item.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Item Details */}
        <div className="p-4 sm:p-5">
          <div className="mb-3">
            <span className="inline-block text-gold/60 text-[10px] tracking-[0.15em] uppercase font-body mb-1.5">
              {item.category}
            </span>
            <h3 className="font-display text-lg text-brown group-hover:text-gold transition-colors duration-300">
              {item.name}
            </h3>
          </div>

          <p className="text-brown/50 text-sm leading-relaxed mb-5 line-clamp-2 font-body">
            {item.description}
          </p>

          <motion.button
            onClick={handleAdd}
            disabled={soldOut}
            whileHover={soldOut ? {} : { scale: 1.02 }}
            whileTap={soldOut ? {} : { scale: 0.98 }}
            className={`w-full py-3 font-body text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              soldOut
                ? "bg-surface-light text-brown/40 cursor-not-allowed"
                : "bg-brown text-white hover:bg-brown-light"
            }`}
          >
            <span>{soldOut ? "Sold Out" : "Add to Cart"}</span>
            {!soldOut && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
