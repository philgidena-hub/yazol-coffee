"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category } from "@/lib/types";
import MenuCard from "./MenuCard";

interface MenuContentProps {
  menuItems: MenuItem[];
  categories: Category[];
}

export default function MenuContent({
  menuItems,
  categories,
}: MenuContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const filteredItems = selectedCategory
    ? menuItems.filter(
        (item) =>
          item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ===
          selectedCategory
      )
    : menuItems;

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-10 sm:mb-12 md:mb-16"
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-block text-gold text-xs tracking-[0.3em] uppercase font-body mb-4"
        >
          Coffee & Ice Cream
        </motion.span>
        <h1 className="font-display text-display-md md:text-display-lg text-brown mb-5">
          Our Menu
        </h1>
        <p className="text-brown/50 text-base md:text-lg max-w-xl mx-auto font-body leading-relaxed">
          Authentic East African flavors, crafted with care and tradition.
          Order online for pickup at 2857 Danforth Ave.
        </p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
      </motion.div>

      {/* Category Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 sm:mb-10 md:mb-14"
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className="relative px-5 md:px-6 py-2 md:py-2.5 rounded-full font-body text-sm whitespace-nowrap transition-colors duration-300"
        >
          {selectedCategory === null && (
            <motion.div
              layoutId="menu-category-pill"
              className="absolute inset-0 bg-brown rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ${
              selectedCategory === null
                ? "text-white font-medium"
                : "text-brown/50 hover:text-brown"
            }`}
          >
            All
          </span>
        </button>
        {sortedCategories.map((category) => (
          <button
            key={category.slug}
            onClick={() => setSelectedCategory(category.slug)}
            className="relative px-5 md:px-6 py-2 md:py-2.5 rounded-full font-body text-sm whitespace-nowrap transition-colors duration-300"
          >
            {selectedCategory === category.slug && (
              <motion.div
                layoutId="menu-category-pill"
                className="absolute inset-0 bg-brown rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-200 ${
                selectedCategory === category.slug
                  ? "text-white font-medium"
                  : "text-brown/50 hover:text-brown"
              }`}
            >
              {category.name}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Items count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-brown/40 text-xs tracking-[0.2em] uppercase font-body mb-8 text-center md:text-left"
      >
        {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
      </motion.p>

      {/* Menu Items Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory || "all"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {filteredItems.map((item, index) => (
            <MenuCard key={item.PK} item={item} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <p className="text-brown/50 text-xl font-display">
            No items found
          </p>
          <p className="text-brown/40 text-sm font-body mt-2">
            Try selecting a different category
          </p>
        </motion.div>
      )}
    </>
  );
}
