"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: scrollRef });
  const progressWidth = useTransform(scrollXProgress, [0, 1], ["0%", "100%"]);

  if (featured.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-bg overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="flex items-end justify-between mb-8 sm:mb-10 md:mb-12">
          <div>
            <LineReveal>
              <span className="text-gold text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase font-body block mb-2">
                Popular
              </span>
            </LineReveal>
            <TextReveal
              as="h2"
              className="font-display text-display-sm text-brown"
              delay={0.1}
            >
              Our Favorites
            </TextReveal>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <motion.a
              href="/menu"
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-brown/50 hover:text-gold transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-2 px-2"
        >
          {featured.map((item, i) => (
            <FeaturedCard key={item.slug} item={item} index={i} />
          ))}
          <div className="flex-shrink-0 w-1" aria-hidden="true" />
        </div>

        {/* Scroll progress bar */}
        <div className="mt-6 sm:mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-black/10 relative overflow-hidden rounded-full">
            <motion.div
              style={{ width: progressWidth }}
              className="absolute inset-y-0 left-0 bg-gold/60 rounded-full"
            />
          </div>
          <span className="text-brown/30 font-body text-[10px] tracking-widest uppercase flex-shrink-0">
            Scroll
          </span>
        </div>

        {/* Mobile view all link */}
        <div className="md:hidden mt-6 text-center">
          <a
            href="/menu"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-brown/50 hover:text-gold transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
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
      className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[340px] lg:w-[380px] snap-start group"
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-black/5 shadow-card hover:shadow-card-hover transition-shadow duration-500"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, (max-width: 1024px) 340px, 380px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
            <h3 className="font-display text-base sm:text-lg text-brown leading-tight group-hover:text-gold transition-colors duration-300">
              {item.name}
            </h3>
            <span className="text-gold font-display text-base sm:text-lg flex-shrink-0">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-brown/50 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-4 font-body">
            {item.description}
          </p>

          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-brown text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-body tracking-wide hover:bg-brown-light transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add to Cart
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
