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
        <div className="mb-14">
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

        {/* Asymmetric grid: first 2 large, rest standard */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {featured.slice(0, 2).map((item, i) => (
            <div key={item.slug} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              <ProductCard
                item={item}
                index={i}
                variant="featured"
              />
            </div>
          ))}
          {featured.slice(2).map((item, i) => (
            <ProductCard
              key={item.slug}
              item={item}
              index={i + 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
