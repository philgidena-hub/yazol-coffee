"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const [active, setActive] = useState<string | null>(null);

  const handleClick = (slug: string | null) => {
    setActive(slug);
    if (slug) {
      const el = document.getElementById(`category-${slug}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const el = document.getElementById("menu");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const allItems = [
    { slug: null, name: "All" },
    ...categories.sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div className="sticky top-[72px] z-40 bg-bg/95 backdrop-blur-md border-b border-cream/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide mask-fade-x">
          {allItems.map((item) => (
            <button
              key={item.slug ?? "all"}
              onClick={() => handleClick(item.slug)}
              className="relative px-5 py-2 rounded-full text-sm font-body whitespace-nowrap transition-colors duration-300"
            >
              {active === item.slug && (
                <motion.div
                  layoutId="category-pill"
                  className="absolute inset-0 bg-gold rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-200 ${
                  active === item.slug
                    ? "text-bg"
                    : "text-cream-muted hover:text-cream"
                }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
