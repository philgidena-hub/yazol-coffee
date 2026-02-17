"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";

interface ProductCardProps {
  item: MenuItem;
  index?: number;
}

export default function ProductCard({
  item,
  index = 0,
}: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const toast = useToast();
  const imageSrc = getProductImage(item.slug);

  const handleAdd = () => {
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
      className="group"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl aspect-[4/5] mb-3">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

        {/* Add to cart - appears on hover */}
        <motion.button
          onClick={handleAdd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-gold text-bg rounded-full flex items-center justify-center shadow-gold-md translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-light"
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
          <h3 className="font-display text-cream text-sm md:text-base leading-snug">
            {item.name}
          </h3>
          <span className="text-gold font-display text-sm flex-shrink-0">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-cream-muted text-xs leading-relaxed line-clamp-1">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
