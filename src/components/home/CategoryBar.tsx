"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import type { Category } from "@/lib/types";

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  // Only show after scrolling past hero
  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 600);
  });

  useEffect(() => {
    // Update active category based on scroll position
    const handleScroll = () => {
      const sections = document.querySelectorAll("[id^='category-']");
      let current: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) {
          current = section.id.replace("category-", "");
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <motion.div
      initial={false}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed top-[72px] left-0 right-0 z-40 bg-bg/90 backdrop-blur-xl border-b border-cream/5"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide mask-fade-x">
          {allItems.map((item) => (
            <button
              key={item.slug ?? "all"}
              onClick={() => handleClick(item.slug)}
              className="relative px-5 py-2 rounded-full text-sm font-body whitespace-nowrap transition-colors duration-300"
            >
              {active === item.slug && (
                <motion.div
                  layoutId="category-pill"
                  className="absolute inset-0 bg-gold/15 border border-gold/30 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-200 ${
                  active === item.slug
                    ? "text-gold"
                    : "text-cream-muted hover:text-cream"
                }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
