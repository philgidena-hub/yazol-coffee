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

/* ─── Section Themes (mirrors landing page) ─── */
type SectionTheme = "coffee" | "ice-cream";

const THEME: Record<SectionTheme, {
  pageBg: string;
  stickyBg: string;
  toggleBg: string;
  toggleActiveStyle: string;
  toggleInactiveStyle: string;
  pillActive: string;
  pillInactive: string;
  heading: string;
  subtitle: string;
  subheading: string;
  count: string;
  emptyTitle: string;
  emptySub: string;
}> = {
  coffee: {
    pageBg: "#1a1209",
    stickyBg: "rgba(26,18,9,0.97)",
    toggleBg: "bg-[#2a1f12] border border-amber-900/30",
    toggleActiveStyle: "bg-amber-200 text-[#1a1209] shadow-md",
    toggleInactiveStyle: "text-amber-200/60 hover:text-amber-100",
    pillActive: "bg-amber-200 text-[#1a1209] font-medium shadow-sm",
    pillInactive: "text-amber-200/50 hover:text-amber-200 bg-amber-200/5",
    heading: "text-white",
    subtitle: "text-amber-300/70",
    subheading: "text-amber-100",
    count: "text-amber-300/40",
    emptyTitle: "text-white/50",
    emptySub: "text-white/30",
  },
  "ice-cream": {
    pageBg: "#f8d7e0",
    stickyBg: "rgba(248,215,224,0.97)",
    toggleBg: "bg-pink-100/70 border border-pink-200/50",
    toggleActiveStyle: "bg-pink-500 text-white shadow-md",
    toggleInactiveStyle: "text-pink-400/70 hover:text-pink-500",
    pillActive: "bg-pink-500 text-white font-medium shadow-sm",
    pillInactive: "text-pink-500/50 hover:text-pink-600 bg-pink-200/30",
    heading: "text-gray-800",
    subtitle: "text-pink-500/70",
    subheading: "text-gray-700",
    count: "text-pink-400/50",
    emptyTitle: "text-gray-600/50",
    emptySub: "text-gray-500/40",
  },
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
  const themeKey: SectionTheme = (activeMain?.iconType as SectionTheme) || "coffee";
  const t = THEME[themeKey];

  const sectionCategories = useMemo(() => {
    const filtered = categories.filter((c) => c.section === activeSection);
    return [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, activeSection]);

  const sectionCategorySlugs = useMemo(
    () => new Set(sectionCategories.map((c) => c.slug)),
    [sectionCategories]
  );

  const sectionItems = useMemo(
    () => menuItems.filter((item) => {
      const raw = item as unknown as Record<string, unknown>;
      const gsi1pk = raw.GSI1PK ? String(raw.GSI1PK).replace("CATEGORY#", "") : "";
      const itemCatSlug = item.categorySlug || gsi1pk || slugify(item.category);
      return sectionCategorySlugs.has(itemCatSlug);
    }),
    [menuItems, sectionCategorySlugs]
  );

  const groupedItems = useMemo(() => {
    const groups: { category: Category; items: MenuItem[] }[] = [];
    for (const cat of sectionCategories) {
      const catItems = sectionItems.filter(
        (item) => {
          const raw = item as unknown as Record<string, unknown>;
          const gsi1pk = raw.GSI1PK ? String(raw.GSI1PK).replace("CATEGORY#", "") : "";
          const itemCatSlug = item.categorySlug || gsi1pk || slugify(item.category);
          return itemCatSlug === cat.slug;
        }
      );
      if (catItems.length > 0) {
        groups.push({ category: cat, items: catItems });
      }
    }
    return groups;
  }, [sectionCategories, sectionItems]);

  useEffect(() => {
    if (sectionCategories.length > 0) {
      setActiveSubcategory(sectionCategories[0].slug);
    }
  }, [sectionCategories]);

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

  return (
    <main
      className="min-h-screen relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: t.pageBg }}
    >
      {/* Sticky header — full width */}
      <div
        className="sticky top-16 sm:top-[72px] z-30 backdrop-blur-sm pb-3 transition-colors duration-500"
        style={{ backgroundColor: t.stickyBg }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20">
          {/* Main Category Toggle */}
          {mainCategories.length > 1 && (
            <div className="flex justify-center pt-3 mb-3">
              <div className={`inline-flex items-center rounded-full p-1 gap-0.5 transition-colors duration-500 ${t.toggleBg}`}>
                {mainCategories.map((mc) => {
                  const Icon = ICON_MAP[mc.iconType] || CoffeeIcon;
                  const isActive = activeSection === mc.slug;
                  const mcTheme = THEME[(mc.iconType as SectionTheme) || "coffee"];
                  return (
                    <button
                      key={mc.slug}
                      onClick={() => handleSectionChange(mc.slug)}
                      className={`inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? mcTheme.toggleActiveStyle
                          : t.toggleInactiveStyle
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

          {/* Subcategory Pill Bar */}
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
                  className={`relative flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-2 rounded-full font-body text-sm whitespace-nowrap transition-all duration-200 touch-target ${
                    isActive ? t.pillActive : t.pillInactive
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20 pt-32 pb-20">
        {activeMain && (
          <div className="mb-6 sm:mb-8">
            <h1 className={`font-display text-2xl sm:text-display-md md:text-display-lg ${t.heading} mb-0.5 transition-colors duration-500`}>
              {activeMain.name}
            </h1>
            <p className={`${t.subtitle} text-sm font-body transition-colors duration-500`}>
              {activeMain.subtitle}
            </p>
          </div>
        )}

        {groupedItems.length > 0 ? (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {groupedItems.map(({ category, items }) => (
              <section
                key={category.slug}
                ref={(el) => { sectionRefs.current[category.slug] = el; }}
              >
                <h2 className={`font-display text-lg md:text-xl ${t.subheading} mb-1 transition-colors duration-500`}>
                  {category.name}{" "}
                  <span className={`${t.count} text-sm font-body`}>
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-3">
                  {items.map((item) => (
                    <MenuCard key={item.PK} item={item} theme={themeKey} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className={`${t.emptyTitle} text-xl font-display`}>No items found</p>
            <p className={`${t.emptySub} text-sm font-body mt-2`}>
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
