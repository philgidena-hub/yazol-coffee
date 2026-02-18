"use client";

import type { MenuItem, Category } from "@/lib/types";
import ProductCard from "./ProductCard";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal } from "@/components/ui/TextReveal";

interface ProductGridProps {
  items: MenuItem[];
  categories: Category[];
}

export default function ProductGrid({ items, categories }: ProductGridProps) {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="menu" className="py-24 bg-bg scroll-mt-[140px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <LineReveal>
            <span className="text-gold text-sm tracking-[0.2em] uppercase font-body">
              Full Menu
            </span>
          </LineReveal>
          <TextReveal
            as="h2"
            className="font-display text-display-sm text-cream mt-2"
            delay={0.1}
          >
            Browse & Order
          </TextReveal>
        </div>

        {sorted.map((category, catIndex) => {
          const catItems = items.filter(
            (item) =>
              item.category.toLowerCase().replace(/[\s&]+/g, "-") ===
              category.slug
          );
          if (catItems.length === 0) return null;

          return (
            <div
              key={category.slug}
              id={`category-${category.slug}`}
              className="mb-20 last:mb-0 scroll-mt-[140px]"
            >
              {/* Category header with gold line */}
              <LineReveal delay={0.05}>
                <div className="flex items-center gap-4 mb-10">
                  <h3 className="font-display text-lg md:text-xl text-gold whitespace-nowrap">
                    {category.name}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
                </div>
              </LineReveal>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {catItems.map((item, i) => (
                  <ProductCard key={item.slug} item={item} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
