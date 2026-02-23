"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal, FadeUp } from "@/components/ui/TextReveal";

const infoVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      type: "spring" as const,
      damping: 20,
      stiffness: 80,
    },
  }),
};

export default function LocationHours() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.05, 1]);

  return (
    <section className="relative overflow-hidden">
      {/* Light section with storefront + info */}
      <div className="bg-bg px-5 sm:px-6 md:px-12 lg:px-20 pb-16 sm:pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Storefront image with clip-path reveal */}
          <motion.div
            ref={imgRef}
            initial={{ opacity: 0, clipPath: "inset(5% 5% 5% 5% round 16px)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-12 sm:mb-16 md:mb-24"
          >
            <div className="aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] relative">
              <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
                <Image
                  src="/Images/storefront-wide.jpg"
                  alt="Yazol Coffee storefront"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-12">
            <div className="lg:col-span-5">
              <LineReveal>
                <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold mb-4 sm:mb-5">
                  Visit us
                </p>
              </LineReveal>
              <TextReveal
                as="h2"
                className="font-display text-[clamp(1.8rem,4vw,4rem)] leading-[0.95] tracking-[-0.02em] text-brown mb-4 sm:mb-6"
              >
                Stop by for takeout
              </TextReveal>
              <FadeUp delay={0.2}>
                <p className="font-body text-brown/60 text-sm sm:text-base md:text-lg leading-relaxed max-w-md">
                  Grab your favourite coffee, ice cream, and treats on the go.
                  Bringing flavor and convenience to the neighborhood.
                </p>
              </FadeUp>
            </div>

            <motion.div
              className="lg:col-span-6 lg:col-start-7"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {/* Address */}
              <motion.div custom={0} variants={infoVariants} className="py-5 sm:py-6 md:py-8 border-b border-black/8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-2 sm:mb-3">Address</p>
                    <p className="font-display text-lg sm:text-xl md:text-2xl text-brown">2857 Danforth Ave</p>
                    <p className="font-body text-brown/50 mt-1 text-sm">Toronto, ON M4C 1M2</p>
                  </div>
                  <Link
                    href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[10px] tracking-[0.15em] uppercase text-gold hover:text-brown transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    Directions
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </Link>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div custom={1} variants={infoVariants} className="py-5 sm:py-6 md:py-8 border-b border-black/8">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-3 sm:mb-4">Hours</p>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="font-display text-base sm:text-lg md:text-xl text-brown">Mon — Fri</p>
                    <p className="font-body text-gold text-sm mt-1">8:00 AM — 6:00 PM</p>
                  </div>
                  <div>
                    <p className="font-display text-base sm:text-lg md:text-xl text-brown">Sat — Sun</p>
                    <p className="font-body text-gold text-sm mt-1">9:00 AM — 5:00 PM</p>
                  </div>
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div custom={2} variants={infoVariants} className="py-5 sm:py-6 md:py-8">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-3 sm:mb-4">Contact</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <Link href="tel:+14166905423" className="font-display text-base sm:text-lg md:text-xl text-brown hover:text-gold transition-colors">
                    (416) 690-5423
                  </Link>
                  <Link href="mailto:yazolcoffee@gmail.com" className="font-body text-brown/50 hover:text-brown transition-colors text-sm">
                    yazolcoffee@gmail.com
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-brown">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20 }}
            className="text-center"
          >
            <TextReveal
              as="p"
              className="font-display text-[clamp(1.3rem,4vw,3.5rem)] leading-[1] text-white mb-6 sm:mb-8"
            >
              Ready for a cup?
            </TextReveal>
            <FadeUp delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/menu"
                    className="inline-block w-full sm:w-auto text-center px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-brown font-display text-sm rounded-full hover:bg-bg transition-colors duration-300"
                  >
                    Order for Pickup
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/menu"
                    className="inline-block w-full sm:w-auto text-center px-8 sm:px-10 py-3.5 sm:py-4 border border-white/30 text-white/80 font-display text-sm rounded-full hover:border-white/60 hover:text-white transition-all duration-300"
                  >
                    View Menu
                  </Link>
                </motion.div>
              </div>
            </FadeUp>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
