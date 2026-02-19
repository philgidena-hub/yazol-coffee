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
      <motion.div
        style={{ scale }}
        className="relative rounded-3xl overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center"
      >
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
        <div className="absolute inset-0 bg-bg/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/50 to-transparent" />

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
                Place your order online and pick up fresh at our Danforth Ave
                location. Skip the wait, savor the taste.
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

          {/* Right — Glass stats */}
          <div className="hidden lg:flex flex-col items-end gap-4">
            {[
              {
                label: "Pickup Time",
                value: "~15 min",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                label: "Location",
                value: "Danforth Ave",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
              {
                label: "Menu Items",
                value: "17+",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                ),
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring", damping: 20 }}
                className="bg-cream/[0.06] backdrop-blur-xl border border-cream/10 rounded-2xl px-7 py-5 w-64 flex items-center gap-4 hover:bg-cream/[0.1] transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="text-right flex-1">
                  <p className="text-cream/30 text-[10px] tracking-[0.2em] uppercase font-body mb-0.5">
                    {stat.label}
                  </p>
                  <p className="font-display text-xl text-cream">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-6 right-6 w-20 h-20 border border-cream/[0.06] rounded-2xl pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-20 h-20 border border-cream/[0.06] rounded-2xl pointer-events-none" />
      </motion.div>
    </section>
  );
}
