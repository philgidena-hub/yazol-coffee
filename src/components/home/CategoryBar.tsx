"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import type { Category } from "@/lib/types";

const NAV_HEIGHT = 72;
const BAR_HEIGHT = 52;
const SCROLL_OFFSET = NAV_HEIGHT + BAR_HEIGHT + 16;

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastY = useRef(0);

  // Show after scrolling past hero, hide with nav on scroll-down
  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 600);
    setNavHidden(latest > lastY.current && latest > 100);
    lastY.current = latest;
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[id^='category-']");
      let current: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= SCROLL_OFFSET + 40) {
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
    const targetId = slug ? `category-${slug}` : "menu";
    const el = document.getElementById(targetId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const allItems = [
    { slug: null, name: "All" },
    ...categories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ slug: c.slug, name: c.name })),
  ];

  const shouldShow = visible && !navHidden;

  return (
    <motion.div
      initial={false}
      animate={{
        y: shouldShow ? 0 : -100,
        opacity: shouldShow ? 1 : 0,
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
