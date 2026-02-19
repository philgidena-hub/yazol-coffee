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
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={ref} className="relative py-4 px-4 md:px-8 lg:px-12">
      <motion.div style={{ scale }} className="relative rounded-3xl overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        {/* Parallax background */}
        <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.3]">
          <Image
            src="/Images/interior-wide.jpg"
            alt="Yazol Coffee interior"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-bg/60 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
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
              <p className="text-cream-muted font-body text-lg mb-10 max-w-md leading-relaxed">
                Place your order online and pick up fresh at our Danforth Ave location. Skip the wait, savor the taste.
              </p>
            </LineReveal>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 100 }}
              className="flex flex-wrap gap-4"
            >
              {itemCount > 0 ? (
                <motion.button
                  onClick={openCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 bg-gold text-bg font-display text-sm rounded-full shadow-gold-md hover:shadow-gold-lg transition-shadow"
                >
                  View Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/menu"
                    className="inline-block px-10 py-4 bg-gold text-bg font-display text-sm rounded-full shadow-gold-md hover:shadow-gold-lg transition-shadow"
                  >
                    Start Your Order
                  </Link>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="tel:+14166905423"
                  className="inline-block px-10 py-4 border border-cream/20 text-cream font-display text-sm rounded-full hover:border-cream/50 hover:bg-cream/5 transition-all"
                >
                  Call Us
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right side decorative stats */}
          <div className="hidden lg:flex flex-col items-end gap-6">
            {[
              { label: "Pickup Time", value: "~15 min" },
              { label: "Location", value: "Danforth Ave" },
              { label: "Menu Items", value: "17+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring", damping: 20 }}
                className="bg-cream/5 backdrop-blur-sm border border-cream/10 rounded-2xl px-8 py-5 text-right"
              >
                <p className="text-cream/40 text-[10px] tracking-[0.2em] uppercase font-body mb-1">
                  {stat.label}
                </p>
                <p className="font-display text-2xl text-cream">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
