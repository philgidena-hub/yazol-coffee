"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const pillBarRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const activeMain = mainCategories.find((m) => m.slug === activeSection) || mainCategories[0];

  const sectionCategories = useMemo(() => {
    const filtered = categories.filter((c) => c.section === activeSection);
    return [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, activeSection]);

  const sectionCategorySlugs = useMemo(
    () => new Set(sectionCategories.map((c) => c.slug)),
    [sectionCategories]
  );

  const sectionItems = useMemo(
    () => menuItems.filter((item) => sectionCategorySlugs.has(slugify(item.category))),
    [menuItems, sectionCategorySlugs]
  );

  const groupedItems = useMemo(() => {
    const groups: { category: Category; items: MenuItem[] }[] = [];
    for (const cat of sectionCategories) {
      const catItems = sectionItems.filter(
        (item) => slugify(item.category) === cat.slug
      );
      if (catItems.length > 0) {
        groups.push({ category: cat, items: catItems });
      }
    }
    return groups;
  }, [sectionCategories, sectionItems]);

  // Set first subcategory as active on section change
  useEffect(() => {
    if (sectionCategories.length > 0) {
      setActiveSubcategory(sectionCategories[0].slug);
    }
  }, [sectionCategories]);

  // Scroll spy — update active pill based on scroll position
  useEffect(() => {
    const catsSnapshot = sectionCategories;

    const handleScroll = () => {
      if (isScrolling.current) return;

      const offset = 180;
      let current: string | null = null;

      for (const cat of catsSnapshot) {
        const el = sectionRefs.current[cat.slug];
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= offset) current = cat.slug;
        }
      }

      if (current) {
        setActiveSubcategory((prev) => (prev === current ? prev : current));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionCategories]);

  // Scroll active pill horizontally in the pill bar (no scrollIntoView — it hijacks page scroll on mobile)
  useEffect(() => {
    if (!activeSubcategory || !pillBarRef.current) return;
    const pill = pillBarRef.current.querySelector(`[data-slug="${activeSubcategory}"]`) as HTMLElement | null;
    if (pill) {
      const container = pillBarRef.current;
      const scrollLeft = pill.offsetLeft - container.offsetWidth / 2 + pill.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeSubcategory]);

  const scrollToCategory = useCallback((slug: string) => {
    setActiveSubcategory(slug);
    const el = sectionRefs.current[slug];
    if (el) {
      isScrolling.current = true;
      const y = el.getBoundingClientRect().top + window.scrollY - 170;
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(() => { isScrolling.current = false; }, 800);
    }
  }, []);

  function handleSectionChange(slug: string) {
    setActiveSection(slug);
    setActiveSubcategory(null);
  }

  const pillBg = activeMain ? (ACCENT_BG[activeMain.accentColor] || "bg-brown") : "bg-brown";

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-[72px] z-30 bg-bg/95 backdrop-blur-sm pb-3 -mx-5 px-5 sm:-mx-6 sm:px-6 md:-mx-12 md:px-12 lg:-mx-20 lg:px-20">
        {/* Main Category Toggle */}
        {mainCategories.length > 1 && (
          <div className="flex justify-center pt-3 mb-3">
            <div className="inline-flex items-center bg-surface-light rounded-full p-1 gap-0.5">
              {mainCategories.map((mc) => {
                const Icon = ICON_MAP[mc.iconType] || CoffeeIcon;
                const isActive = activeSection === mc.slug;
                const activeClass = ACCENT_TEXT_ACTIVE[mc.accentColor] || "bg-brown text-white";
                return (
                  <button
                    key={mc.slug}
                    onClick={() => handleSectionChange(mc.slug)}
                    className={`inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-body text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `${activeClass} shadow-sm`
                        : "text-brown/50 hover:text-brown"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{mc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Subcategory Pill Bar — horizontal scroll on mobile */}
        <div
          ref={pillBarRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        >
          {sectionCategories.map((category) => {
            const isActive = activeSubcategory === category.slug;
            return (
              <button
                key={category.slug}
                data-slug={category.slug}
                onClick={() => scrollToCategory(category.slug)}
                className={`relative flex-shrink-0 px-4 sm:px-5 py-2 rounded-full font-body text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `${pillBg} text-white font-medium shadow-sm`
                    : "text-brown/50 hover:text-brown bg-surface-light/50"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header + Content */}
      <div className="mt-6">
        {activeMain && (
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-display-md md:text-display-lg text-brown mb-0.5">
              {activeMain.name}
            </h1>
            <p className="text-brown/50 text-sm font-body">
              {activeMain.subtitle}
            </p>
          </div>
        )}

        {/* Grouped items by subcategory */}
        {groupedItems.length > 0 ? (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {groupedItems.map(({ category, items }) => (
              <section
                key={category.slug}
                ref={(el) => { sectionRefs.current[category.slug] = el; }}
              >
                <h2 className="font-display text-lg md:text-xl text-brown mb-1">
                  {category.name}{" "}
                  <span className="text-brown/40 text-sm font-body">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-3">
                  {items.map((item) => (
                    <MenuCard key={item.PK} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-brown/50 text-xl font-display">No items found</p>
            <p className="text-brown/40 text-sm font-body mt-2">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </>
  );
}
