"use client";

import type { MenuItem } from "@/lib/types";
import ProductCard from "./ProductCard";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal } from "@/components/ui/TextReveal";

interface FeaturedProductsProps {
  items: MenuItem[];
}

const FEATURED_SLUGS = [
  "jebena-buna",
  "ambasha",
  "samosas",
  "yazol-soup",
  "falafel",
  "yazol-dessert-cup",
];

export default function FeaturedProducts({ items }: FeaturedProductsProps) {
  const featured = FEATURED_SLUGS.map((slug) =>
    items.find((i) => i.slug === slug)
  ).filter(Boolean) as MenuItem[];

  if (featured.length === 0) return null;

  return (
    <section className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-14">
          <div>
            <LineReveal>
              <span className="text-gold text-sm tracking-[0.2em] uppercase font-body">
                Popular
              </span>
            </LineReveal>
            <TextReveal
              as="h2"
              className="font-display text-display-sm text-cream mt-2"
              delay={0.1}
            >
              Our Favorites
            </TextReveal>
          </div>
          <LineReveal delay={0.2}>
            <a
              href="/menu"
              className="hidden md:inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-cream-muted hover:text-gold transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </LineReveal>
        </div>

        {/* Masonry-like grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {featured.slice(0, 1).map((item, i) => (
            <div key={item.slug} className="md:col-span-2 md:row-span-2">
              <ProductCard item={item} index={i} variant="featured" />
            </div>
          ))}
          {featured.slice(1).map((item, i) => (
            <ProductCard key={item.slug} item={item} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
