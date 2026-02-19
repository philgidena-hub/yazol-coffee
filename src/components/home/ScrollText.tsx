"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollText() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["10%", "-40%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 bg-bg overflow-hidden select-none"
    >
      {/* Subtle gold glow in center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,165,116,0.03)_0%,transparent_60%)]" />

      <motion.div style={{ opacity }} className="space-y-2 md:space-y-4">
        {/* Line 1 — scrolls left */}
        <motion.div style={{ x: x1 }} className="flex items-center gap-4 md:gap-8 whitespace-nowrap">
          {["Coffee", "&", "Ice Cream", "·", "East African Flavors", "·", "2857 Danforth Ave", "·", "Coffee", "&", "Ice Cream"].map((word, i) => (
            <span
              key={i}
              className={`font-display tracking-[-0.02em] ${
                word === "·" || word === "&"
                  ? "text-gold/30 text-4xl md:text-6xl"
                  : "text-cream/[0.07] text-6xl md:text-[8rem] leading-none"
              }`}
            >
              {word}
            </span>
          ))}
        </motion.div>

        {/* Line 2 — scrolls right */}
        <motion.div style={{ x: x2 }} className="flex items-center gap-4 md:gap-8 whitespace-nowrap">
          {["Family Owned", "·", "Scoop Stop", "·", "Tradition Meets Heart", "·", "Order Online", "·", "Family Owned", "·", "Scoop Stop"].map((word, i) => (
            <span
              key={i}
              className={`font-display tracking-[-0.02em] ${
                word === "·"
                  ? "text-gold/30 text-4xl md:text-6xl"
                  : "text-cream/[0.07] text-6xl md:text-[8rem] leading-none"
              }`}
            >
              {word}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
