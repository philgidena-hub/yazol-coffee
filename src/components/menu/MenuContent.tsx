"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category, MainCategory } from "@/lib/types";
import MenuCard from "./MenuCard";

/* ─── Icons ─── */
function CoffeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 110 8h-1" />
      <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

function IceCreamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 015 5v1H7V7a5 5 0 015-5z" />
      <path d="M7 8l5 14 5-14" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  coffee: CoffeeIcon,
  "ice-cream": IceCreamIcon,
};

/** Map accent color token to Tailwind bg class. Only allow known safe values. */
const ACCENT_BG: Record<string, string> = {
  brown: "bg-brown",
  "teal-600": "bg-teal-600",
  "indigo-600": "bg-indigo-600",
  "rose-600": "bg-rose-600",
  "amber-600": "bg-amber-600",
  "emerald-600": "bg-emerald-600",
};

const ACCENT_TEXT_ACTIVE: Record<string, string> = {
  brown: "bg-brown text-white",
  "teal-600": "bg-teal-600 text-white",
  "indigo-600": "bg-indigo-600 text-white",
  "rose-600": "bg-rose-600 text-white",
  "amber-600": "bg-amber-600 text-white",
  "emerald-600": "bg-emerald-600 text-white",
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface MenuContentProps {
  menuItems: MenuItem[];
  categories: Category[];
  mainCategories: MainCategory[];
  initialSection?: string;
}

export default function MenuContent({
  menuItems,
  categories,
  mainCategories,
  initialSection,
}: MenuContentProps) {
  const defaultSection = initialSection || mainCategories[0]?.slug || "";
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeMain = mainCategories.find((m) => m.slug === activeSection) || mainCategories[0];

  // Filter categories by active section
  const sectionCategories = useMemo(() => {
    const filtered = categories.filter((c) => c.section === activeSection);
    return [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, activeSection]);

  // Build a set of category slugs in the active section for item filtering
  const sectionCategorySlugs = useMemo(
    () => new Set(sectionCategories.map((c) => c.slug)),
    [sectionCategories]
  );

  // Filter items: must belong to active section, then optionally by selected category
  const filteredItems = useMemo(() => {
    let items = menuItems.filter((item) =>
      sectionCategorySlugs.has(slugify(item.category))
    );
    if (selectedCategory) {
      items = items.filter(
        (item) => slugify(item.category) === selectedCategory
      );
    }
    return items;
  }, [menuItems, sectionCategorySlugs, selectedCategory]);

  // Group items by category for section display
  const groupedItems = useMemo(() => {
    const groups: { category: Category; items: MenuItem[] }[] = [];
    for (const cat of sectionCategories) {
      const catItems = filteredItems.filter(
        (item) => slugify(item.category) === cat.slug
      );
      if (catItems.length > 0) {
        groups.push({ category: cat, items: catItems });
      }
    }
    return groups;
  }, [sectionCategories, filteredItems]);

  function handleSectionChange(slug: string) {
    setActiveSection(slug);
    setSelectedCategory(null);
  }

  const pillBg = activeMain ? (ACCENT_BG[activeMain.accentColor] || "bg-brown") : "bg-brown";

  return (
    <>
      {/* Main Category Toggle */}
      {mainCategories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center bg-surface-light rounded-full p-1 gap-1">
            {mainCategories.map((mc) => {
              const Icon = ICON_MAP[mc.iconType] || CoffeeIcon;
              const isActive = activeSection === mc.slug;
              const activeClass = ACCENT_TEXT_ACTIVE[mc.accentColor] || "bg-brown text-white";
              return (
                <button
                  key={mc.slug}
                  onClick={() => handleSectionChange(mc.slug)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? `${activeClass} shadow-sm`
                      : "text-brown/50 hover:text-brown"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mc.name}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Subcategory Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 sm:mb-10 md:mb-12"
      >
        {sectionCategories.map((category) => (
          <button
            key={category.slug}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === category.slug ? null : category.slug
              )
            }
            className="relative px-5 md:px-6 py-2 md:py-2.5 rounded-full font-body text-sm whitespace-nowrap transition-colors duration-300"
          >
            {selectedCategory === category.slug && (
              <motion.div
                layoutId="menu-category-pill"
                className={`absolute inset-0 rounded-full ${pillBg}`}
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

      {/* Section Header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeMain && (
            <div className="mb-8 sm:mb-10">
              <h1 className="font-display text-display-md md:text-display-lg text-brown mb-1">
                {activeMain.name}
              </h1>
              <p className="text-brown/50 text-sm md:text-base font-body">
                {activeMain.subtitle}
              </p>
            </div>
          )}

          {/* Grouped items by subcategory */}
          {groupedItems.length > 0 ? (
            <div className="space-y-10 md:space-y-14">
              {groupedItems.map(({ category, items }) => (
                <section key={category.slug}>
                  <h2 className="font-display text-lg md:text-xl text-brown mb-1">
                    {category.name}{" "}
                    <span className="text-brown/40 text-sm font-body">
                      ({items.length} {items.length === 1 ? "item" : "items"})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 mt-4">
                    {items.map((item, index) => (
                      <MenuCard key={item.PK} item={item} index={index} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <p className="text-brown/50 text-xl font-display">
                No items found
              </p>
              <p className="text-brown/40 text-sm font-body mt-2">
                Try selecting a different category
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
