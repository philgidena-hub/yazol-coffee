"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface MarqueeProps {
  children: string;
  reverse?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  reverse = false,
  className = "",
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scroll-linked horizontal movement
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? ["-15%", "5%"] : ["5%", "-15%"]
  );

  return (
    <div
      ref={ref}
      className={`overflow-hidden py-8 md:py-12 ${className}`}
    >
      <motion.div style={{ x }} className="flex whitespace-nowrap">
        {/* Repeat text for seamless loop */}
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="font-display text-[clamp(3rem,8vw,8rem)] leading-none tracking-[-0.03em] text-cream/[0.04] select-none mx-8 flex-shrink-0"
          >
            {children}
            <span className="inline-block mx-8 text-gold/10">&bull;</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
