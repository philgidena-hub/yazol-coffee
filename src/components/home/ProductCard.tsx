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
  variant?: "default" | "featured";
}

export default function ProductCard({
  item,
  index = 0,
  variant = "default",
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

  const isFeatured = variant === "featured";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 80,
        delay: index * 0.08,
      }}
      whileHover={{ y: -6 }}
      className="group bg-surface rounded-2xl overflow-hidden border border-transparent hover:border-gold/10 shadow-card hover:shadow-card-hover transition-[border-color,box-shadow] duration-500"
    >
      <div
        className={`relative overflow-hidden ${isFeatured ? "aspect-[4/5]" : "aspect-[4/3]"}`}
      >
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
          className="object-cover transition-all duration-700 group-hover:scale-105 saturate-[0.85] group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Quick add button */}
        <motion.button
          onClick={handleAdd}
          initial={false}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-gold text-bg rounded-full flex items-center justify-center text-lg font-bold opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-gold-light shadow-gold-md"
        >
          +
        </motion.button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-cream text-base leading-tight group-hover:text-gold transition-colors duration-300">
            {item.name}
          </h3>
          <span className="text-gold font-display text-base whitespace-nowrap glow-text">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-cream-muted text-sm line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
