"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const WORDS = [
  "Coffee",
  "Ice Cream",
  "East African Flavors",
  "Family Owned",
  "Scoop Stop",
  "Danforth Ave",
  "Order Online",
];

export default function ScrollText() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ scaleX }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative py-10 md:py-14 bg-brown overflow-hidden origin-center"
    >
      <div className="flex overflow-hidden">
        <div className="flex shrink-0 gap-8 md:gap-12 animate-marquee items-center whitespace-nowrap">
          {[...WORDS, ...WORDS].map((word, i) => (
            <span key={i} className="flex items-center gap-8 md:gap-12">
              <span className="font-display text-2xl md:text-4xl text-white/90 tracking-wide">
                {word}
              </span>
              <span className="text-brown-warm text-2xl md:text-4xl">·</span>
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
