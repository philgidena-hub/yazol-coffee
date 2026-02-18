"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category } from "@/lib/types";
import MenuCard from "./MenuCard";
import { useTheme, type ThemeKey } from "@/lib/theme-context";

interface MenuContentProps {
  menuItems: MenuItem[];
  categories: Category[];
}

export default function MenuContent({
  menuItems,
  categories,
}: MenuContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { setTheme } = useTheme();

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
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-cream mb-4">
          Our Menu
        </h1>
        <p className="text-cream-muted text-lg md:text-xl max-w-2xl mx-auto">
          Authentic East African flavors, crafted with care and tradition
        </p>
      </motion.div>

      {/* Category Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        <button
          onClick={() => { setSelectedCategory(null); setTheme("drinks"); }}
          className="relative px-6 py-2.5 rounded-full font-body text-sm whitespace-nowrap transition-colors duration-300"
        >
          {selectedCategory === null && (
            <motion.div
              layoutId="menu-category-pill"
              className="absolute inset-0 bg-gold rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ${
              selectedCategory === null
                ? "text-bg"
                : "text-cream-muted hover:text-cream"
            }`}
          >
            All
          </span>
        </button>
        {sortedCategories.map((category) => (
          <button
            key={category.slug}
            onClick={() => { setSelectedCategory(category.slug); setTheme(category.slug as ThemeKey); }}
            className="relative px-6 py-2.5 rounded-full font-body text-sm whitespace-nowrap transition-colors duration-300"
          >
            {selectedCategory === category.slug && (
              <motion.div
                layoutId="menu-category-pill"
                className="absolute inset-0 bg-gold rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-200 ${
                selectedCategory === category.slug
                  ? "text-bg"
                  : "text-cream-muted hover:text-cream"
              }`}
            >
              {category.name}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Menu Items Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory || "all"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          <p className="text-cream-muted text-xl font-body">
            No items found in this category
          </p>
        </motion.div>
      )}
    </>
  );
}
