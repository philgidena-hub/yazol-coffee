"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal } from "@/components/ui/TextReveal";

export default function PromoBanner() {
  const { itemCount, openCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Parallax background image */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.2]">
        <Image
          src="/Images/storefront.jpg"
          alt="Yazol Coffee storefront"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-bg/75 backdrop-blur-[2px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <LineReveal>
          <span className="text-gold text-sm tracking-[0.2em] uppercase font-body">
            Order Online
          </span>
        </LineReveal>

        <TextReveal
          as="h2"
          className="font-display text-display-md text-cream mt-4 mb-5"
          delay={0.1}
        >
          Ready to order?
        </TextReveal>

        <LineReveal delay={0.3}>
          <p className="text-cream-muted font-body text-lg mb-10 max-w-lg mx-auto">
            Place your order online and pick up at our Danforth Ave location.
          </p>
        </LineReveal>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 100 }}
        >
          {itemCount > 0 ? (
            <motion.button
              onClick={openCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 bg-gold text-bg font-display text-sm rounded-full shadow-gold-md hover:shadow-gold-lg transition-shadow animate-gold-pulse"
            >
              View Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </motion.button>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/menu"
                className="inline-block px-10 py-4 bg-gold text-bg font-display text-sm rounded-full shadow-gold-md hover:shadow-gold-lg transition-shadow animate-gold-pulse"
              >
                Start Your Order
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
