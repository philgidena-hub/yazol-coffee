"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function LocationHours() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.05, 1]);

  return (
    <section className="relative overflow-hidden">
      {/* Cream bg section with storefront + info */}
      <div className="bg-cream px-6 md:px-12 lg:px-20 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Storefront image — contained, not full-bleed */}
          <div ref={imgRef} className="relative rounded-2xl overflow-hidden mb-16 md:mb-24">
            <div className="aspect-[21/9] md:aspect-[3/1] relative">
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
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg/20 to-transparent" />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12">
            <div className="lg:col-span-5">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold-dark mb-5"
              >
                Visit us
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[clamp(2rem,4vw,4rem)] leading-[0.95] tracking-[-0.02em] text-bg mb-6"
              >
                Stop by for
                <br />
                <span className="italic text-gold-dark">takeout</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-body text-bg/50 text-base md:text-lg leading-relaxed max-w-md"
              >
                Grab your favourite coffee, ice cream, and treats on the go.
                Bringing flavor and convenience to the neighborhood.
              </motion.p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              {/* Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-6 md:py-8 border-b border-bg/10"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-3">Address</p>
                    <p className="font-display text-xl md:text-2xl text-bg">2857 Danforth Ave</p>
                    <p className="font-body text-bg/50 mt-1 text-sm">Toronto, ON M4C 1M2</p>
                  </div>
                  <Link
                    href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[10px] tracking-[0.15em] uppercase text-gold-dark hover:text-bg transition-colors flex items-center gap-1"
                  >
                    Directions
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </Link>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="py-6 md:py-8 border-b border-bg/10"
              >
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">Hours</p>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="font-display text-lg md:text-xl text-bg">Mon — Fri</p>
                    <p className="font-body text-gold-dark text-sm mt-1">8:00 AM — 6:00 PM</p>
                  </div>
                  <div>
                    <p className="font-display text-lg md:text-xl text-bg">Sat — Sun</p>
                    <p className="font-body text-gold-dark text-sm mt-1">9:00 AM — 5:00 PM</p>
                  </div>
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="py-6 md:py-8"
              >
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">Contact</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <Link href="tel:+14166905423" className="font-display text-lg md:text-xl text-bg hover:text-gold-dark transition-colors">
                    (416) 690-5423
                  </Link>
                  <Link href="mailto:yazolcoffee@gmail.com" className="font-body text-bg/50 hover:text-bg transition-colors text-sm">
                    yazolcoffee@gmail.com
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width dark CTA — flows into footer */}
      <div className="bg-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20 }}
            className="text-center"
          >
            <p className="font-display text-[clamp(1.5rem,4vw,3.5rem)] leading-[1] text-cream mb-8">
              Ready for a cup?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/menu"
                  className="group relative inline-block px-10 py-4 bg-gold text-bg font-display text-sm rounded-full overflow-hidden shadow-gold-md hover:shadow-gold-lg transition-shadow duration-300"
                >
                  <span className="relative z-10">Order for Pickup</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/menu"
                  className="inline-block px-10 py-4 border border-cream/15 text-cream/70 font-display text-sm rounded-full hover:border-gold/30 hover:text-cream transition-all duration-300"
                >
                  View Menu
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
