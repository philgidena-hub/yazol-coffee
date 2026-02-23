"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal, FadeUp } from "@/components/ui/TextReveal";

export default function PromoBanner() {
  const { itemCount, openCart } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-surface-light">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Image with parallax + reveal */}
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(10% 10% 10% 10% round 16px)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3]"
          >
            <motion.div style={{ scale: imgScale, y: imgY }} className="absolute inset-0">
              <Image
                src="/Images/Jebena_buna.jpg"
                alt="Traditional Ethiopian Buna coffee ceremony"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <div>
            <LineReveal>
              <span className="text-gold text-[10px] sm:text-xs md:text-sm tracking-[0.3em] uppercase font-body mb-3 sm:mb-4 block">
                Our Heritage
              </span>
            </LineReveal>

            <TextReveal
              as="h2"
              className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[1.05] text-brown mb-5 sm:mb-6"
              delay={0.1}
            >
              The Ethiopian Coffee Ceremony
            </TextReveal>

            <FadeUp delay={0.2}>
              <p className="text-brown/60 font-body text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6">
                Coffee was born in Ethiopia. The traditional Buna ceremony is more
                than just brewing — it&apos;s a ritual of community, hospitality, and
                connection that has been practiced for centuries.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="text-brown/60 font-body text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                At Yazol, we honour this heritage by bringing authentic Ethiopian
                coffee culture to Toronto. Every cup of our Jebena Buna is a
                tribute to this rich tradition.
              </p>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {itemCount > 0 ? (
                  <motion.button
                    onClick={openCart}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 sm:px-8 py-3 sm:py-3.5 bg-brown text-white font-body text-sm tracking-wider uppercase rounded-full hover:bg-brown-light transition-all duration-300 text-center"
                  >
                    View Cart ({itemCount})
                  </motion.button>
                ) : (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/menu"
                      className="inline-block w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-3.5 bg-brown text-white font-body text-sm tracking-wider uppercase rounded-full hover:bg-brown-light transition-all duration-300"
                    >
                      Try Our Coffee
                    </Link>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 border border-brown/20 text-brown font-body text-sm tracking-wider uppercase rounded-full hover:border-brown/40 transition-all duration-300"
                  >
                    Our Story
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
