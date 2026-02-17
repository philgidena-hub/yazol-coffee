"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";
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
    <section className="py-24 bg-bg overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
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
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </LineReveal>
        </div>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
          {featured.map((item, i) => (
            <FeaturedCard key={item.slug} item={item} index={i} />
          ))}
          {/* End spacer for scroll padding */}
          <div className="flex-shrink-0 w-1" aria-hidden="true" />
        </div>

        {/* Scroll hint - mobile */}
        <div className="flex items-center justify-center gap-1.5 mt-6 md:hidden">
          {featured.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cream/20"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({
  item,
  index,
}: {
  item: MenuItem;
  index: number;
}) {
  const { addItem, openCart } = useCart();
  const toast = useToast();
  const imageSrc = getProductImage(item.slug);

  const handleAdd = () => {
    addItem(item);
    toast.show(`Added ${item.name} to cart`, {
      label: "View Cart",
      onClick: openCart,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 80,
        delay: index * 0.08,
      }}
      className="flex-shrink-0 w-[280px] md:w-[340px] lg:w-[380px] snap-start group"
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 280px, (max-width: 1024px) 340px, 380px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />

        {/* Editorial number */}
        <span className="absolute top-5 left-6 font-display text-cream/10 text-7xl leading-none select-none pointer-events-none">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Price badge */}
        <div className="absolute top-5 right-5 bg-bg/60 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-gold/20">
          <span className="text-gold font-display text-sm">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {/* Content - always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display text-cream text-xl md:text-2xl leading-tight mb-2">
            {item.name}
          </h3>
          <p className="text-cream/50 text-sm leading-relaxed line-clamp-2 mb-5">
            {item.description}
          </p>

          {/* Add to cart button */}
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold px-5 py-2.5 rounded-full text-sm font-body tracking-wide hover:bg-gold hover:text-bg transition-all duration-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
