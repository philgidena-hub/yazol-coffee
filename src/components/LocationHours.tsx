"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function LocationHours() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative bg-cream overflow-hidden">
      {/* Storefront parallax */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.2]">
          <Image
            src="/Images/storefront.jpg"
            alt="Yazol Coffee storefront"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-cream/30" />
      </div>

      {/* Info */}
      <div className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
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
              className="font-display text-[clamp(2rem,5vw,5rem)] leading-[0.9] tracking-[-0.02em] text-bg mb-6"
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
              className="font-body text-bg/50 text-lg leading-relaxed max-w-md"
            >
              Grab your favourite coffee and treats on the go.
              Bringing flavor and convenience to Scarborough.
            </motion.p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-8 border-b border-bg/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-3">Address</p>
                  <p className="font-display text-2xl md:text-3xl text-bg">2857 Danforth Ave</p>
                  <p className="font-body text-bg/50 mt-1">Toronto, ON M4C 1M2</p>
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
              className="py-8 border-b border-bg/10"
            >
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">Hours</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-display text-2xl text-bg">Mon — Fri</p>
                  <p className="font-body text-gold-dark mt-1">8:00 AM — 6:00 PM</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-bg">Sat — Sun</p>
                  <p className="font-body text-gold-dark mt-1">9:00 AM — 5:00 PM</p>
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="py-8"
            >
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">Contact</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <Link href="tel:+14166905423" className="font-display text-2xl text-bg hover:text-gold-dark transition-colors">
                  (416) 690-5423
                </Link>
                <Link href="mailto:yazolcoffee@gmail.com" className="font-body text-bg/50 hover:text-bg transition-colors">
                  yazolcoffee@gmail.com
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto mt-16 p-12 md:p-16 rounded-2xl bg-bg text-center"
        >
          <p className="font-display text-[clamp(1.5rem,3vw,3rem)] leading-[1] text-cream mb-8">
            Ready for a cup?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="group relative px-8 py-4 bg-cream text-bg font-body text-sm tracking-wider uppercase rounded-full overflow-hidden transition-all duration-500"
            >
              <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              <span className="relative z-10">Order for Pickup</span>
            </Link>
            <Link
              href="/menu"
              className="px-8 py-4 border border-cream/20 text-cream font-body text-sm tracking-wider uppercase rounded-full hover:border-cream/50 transition-colors"
            >
              View Menu
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
