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
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 80,
        delay: index * 0.06,
      }}
      className={`group relative bg-surface rounded-2xl overflow-hidden border border-transparent transition-[border-color,box-shadow] duration-500 ${
        soldOut
          ? "opacity-60"
          : "hover:border-gold/10 shadow-card hover:shadow-card-hover"
      }`}
    >
      {/* Sold Out Badge */}
      {soldOut && (
        <div className="absolute top-4 right-4 z-20 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm">
          Sold Out
        </div>
      )}

      {/* Item Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ${
            soldOut ? "grayscale" : "group-hover:scale-105"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Item Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="inline-block px-3 py-0.5 bg-gold/15 text-gold text-xs rounded-full mb-2 font-body">
              {item.category}
            </span>
            <h3 className="font-display text-xl text-cream group-hover:text-gold transition-colors">
              {item.name}
            </h3>
          </div>
          <p className="font-display text-xl text-gold">
            ${item.price.toFixed(2)}
          </p>
        </div>

        <p className="text-cream-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {item.description}
        </p>

        <button
          onClick={handleAdd}
          disabled={soldOut}
          className={`w-full py-3 font-body text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
            soldOut
              ? "bg-surface-light text-cream-muted cursor-not-allowed"
              : "bg-gold text-bg hover:bg-gold-light"
          }`}
        >
          <span>{soldOut ? "Sold Out" : "Add to Cart"}</span>
          {!soldOut && <span className="text-lg">+</span>}
        </button>
      </div>
    </motion.div>
  );
}
