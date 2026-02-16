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
        delay: index * 0.06,
      }}
      className="group relative"
    >
      {/* Image container */}
      <div
        className={`relative overflow-hidden rounded-2xl ${
          isFeatured ? "aspect-[4/5]" : "aspect-[3/4]"
        }`}
      >
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes={
            isFeatured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 50vw, 25vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Price tag */}
        <div className="absolute top-3 right-3 bg-bg/80 backdrop-blur-sm rounded-full px-3 py-1 border border-gold/20">
          <span className="text-gold font-display text-sm">${item.price.toFixed(2)}</span>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <h3 className="font-display text-cream text-base md:text-lg leading-tight mb-1 drop-shadow-lg">
            {item.name}
          </h3>
          <p className="text-cream/60 text-xs md:text-sm line-clamp-2 leading-relaxed transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100">
            {item.description}
          </p>
        </div>

        {/* Add to cart button */}
        <motion.button
          onClick={handleAdd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          className="absolute bottom-4 right-4 w-10 h-10 bg-gold text-bg rounded-full flex items-center justify-center shadow-gold-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-light"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
