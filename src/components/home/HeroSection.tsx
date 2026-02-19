"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { HERO_PRODUCTS } from "@/lib/hero-products";

// Position configs for the 3-slot carousel:
// slot 0 = front/main, slot 1 = right-medium (elevated), slot 2 = right-small (more elevated)
const SLOT_CONFIG = {
  // Desktop (lg+)
  lg: [
    { x: 0, y: 0, scale: 1, opacity: 1, z: 30 },            // front — grounded
    { x: 260, y: -50, scale: 0.58, opacity: 0.85, z: 20 },   // right — elevated
    { x: 410, y: -90, scale: 0.42, opacity: 0.65, z: 10 },   // far right — higher
  ],
  // Tablet (md)
  md: [
    { x: 0, y: 0, scale: 1, opacity: 1, z: 30 },
    { x: 200, y: -40, scale: 0.55, opacity: 0.85, z: 20 },
    { x: 330, y: -70, scale: 0.4, opacity: 0.65, z: 10 },
  ],
  // Mobile (sm)
  sm: [
    { x: 0, y: 0, scale: 1, opacity: 1, z: 30 },
    { x: 140, y: -30, scale: 0.5, opacity: 0.8, z: 20 },
    { x: 235, y: -55, scale: 0.38, opacity: 0.6, z: 10 },
  ],
};

function getSlotIndex(productIndex: number, currentIndex: number, total: number) {
  return (productIndex - currentIndex + total) % total;
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [breakpoint, setBreakpoint] = useState<"sm" | "md" | "lg">("lg");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { setTheme } = useTheme();

  // Track breakpoint for responsive slot configs
  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 1024) setBreakpoint("lg");
      else if (window.innerWidth >= 768) setBreakpoint("md");
      else setBreakpoint("sm");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const product = HERO_PRODUCTS[current];

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
      setTheme(HERO_PRODUCTS[index].categorySlug);
    },
    [setTheme]
  );

  const next = useCallback(() => {
    goTo((current + 1) % HERO_PRODUCTS.length);
  }, [current, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  };

  const handleSelect = (index: number) => {
    goTo(index);
    resetTimer();
  };

  const slots = SLOT_CONFIG[breakpoint];

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-bg theme-transition">
      {/* Gradient blobs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "rgb(var(--theme-accent))" }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "rgb(var(--theme-accent))" }}
      />

      {/* ── Cream wave base ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5] h-[160px] md:h-[220px] lg:h-[260px] theme-transition"
        style={{ backgroundColor: "rgb(var(--theme-cream))" }}
      >
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-[59px] md:-top-[79px] lg:-top-[99px] left-0 w-full h-[60px] md:h-[80px] lg:h-[100px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C240,20 480,100 720,50 C960,0 1200,80 1440,40 L1440,120 L0,120 Z"
            style={{ fill: "rgb(var(--theme-cream))" }}
          />
        </svg>
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-28 lg:pt-32">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0">
          {/* ─ Left: Text ─ */}
          <div className="lg:w-[36%] lg:pt-16 xl:pt-24 z-20 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 25, stiffness: 80 }}
            >
              <span className="inline-block text-gold text-sm tracking-[0.3em] uppercase font-body mb-6 theme-transition">
                Taste the tradition
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="font-display text-display-lg text-cream leading-[0.95] mb-4 theme-transition">
                  {product.name}
                </h1>
                <p className="text-cream-muted text-lg md:text-xl font-body max-w-md leading-relaxed mb-8 theme-transition">
                  {product.tagline}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", damping: 25, stiffness: 80 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/menu"
                  className="inline-block px-8 py-3.5 bg-gold text-bg font-display text-sm rounded-full hover:bg-gold-light transition-colors theme-transition"
                >
                  Order Now
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="#menu"
                  className="inline-block px-8 py-3.5 border border-cream/50 bg-cream/5 text-cream font-display text-sm rounded-full hover:border-cream/70 hover:bg-cream/10 transition-all theme-transition"
                >
                  View Menu
                </Link>
              </motion.div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 mt-10"
            >
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-bg bg-surface flex items-center justify-center text-[10px] text-cream-muted font-body theme-transition"
                  >
                    {["Y", "A", "Z", "O"][i]}
                  </div>
                ))}
              </div>
              <span className="text-cream-muted text-sm font-body theme-transition">
                100+ happy customers
              </span>
            </motion.div>
          </div>

          {/* ─ Right: Product carousel + thumbnails ─ */}
          <div className="lg:w-[64%] relative order-1 lg:order-2">
            {/* Product carousel — all 3 always rendered, animate between positions */}
            <div className="relative h-[340px] sm:h-[400px] md:h-[480px] lg:h-[560px] w-full">
              {HERO_PRODUCTS.map((p, i) => {
                const slot = getSlotIndex(i, current, HERO_PRODUCTS.length);
                const config = slots[slot];

                return (
                  <motion.div
                    key={p.slug}
                    animate={{
                      x: config.x,
                      y: config.y,
                      scale: config.scale,
                      opacity: config.opacity,
                    }}
                    transition={{
                      type: "spring",
                      damping: 28,
                      stiffness: 120,
                    }}
                    className="absolute bottom-0 left-[5%] sm:left-[10%] lg:left-[8%] origin-bottom cursor-pointer"
                    style={{ zIndex: config.z }}
                    onClick={() => {
                      if (slot !== 0) handleSelect(i);
                    }}
                  >
                    <div className="relative w-[240px] h-[300px] sm:w-[280px] sm:h-[360px] md:w-[340px] md:h-[430px] lg:w-[380px] lg:h-[480px]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, (max-width: 1024px) 340px, 380px"
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Circular thumbnails — right edge */}
            <div className="absolute right-2 md:right-4 lg:right-8 top-[30%] z-30 flex flex-col items-center gap-3 lg:gap-4">
              {HERO_PRODUCTS.map((p, i) => (
                <button
                  key={p.slug}
                  onClick={() => handleSelect(i)}
                  className="relative group"
                  aria-label={`Select ${p.name}`}
                >
                  <div
                    className={`relative w-12 h-12 md:w-14 md:h-14 lg:w-[60px] lg:h-[60px] rounded-full overflow-hidden transition-all duration-300 border-2 ${
                      i === current
                        ? "border-gold scale-110 shadow-lg"
                        : "border-cream/20 opacity-60 hover:opacity-90 hover:scale-105"
                    }`}
                    style={{ backgroundColor: "rgb(var(--theme-bg-lighter))" }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="60px"
                      className="object-contain p-1"
                    />
                  </div>
                  {i === current && (
                    <motion.div
                      layoutId="hero-thumb-ring"
                      className="absolute -inset-1.5 rounded-full border-2 border-gold/50"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dot pagination ── */}
      <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {HERO_PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className="group relative p-1"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-7 bg-gold"
                  : "w-2.5 bg-cream-dark/30 hover:bg-cream-dark/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Bottom right: Discover ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 md:bottom-8 right-6 md:right-12 z-20"
      >
        <Link
          href="#menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body tracking-wide border theme-transition"
          style={{
            borderColor: "rgb(var(--theme-accent-dark))",
            color: "rgb(var(--theme-bg))",
            backgroundColor: "rgb(var(--theme-accent) / 0.15)",
          }}
        >
          Discover
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
      </motion.div>

      {/* ── Bottom left: copyright ── */}
      <div className="absolute bottom-6 md:bottom-8 left-6 md:left-12 z-20">
        <span
          className="text-xs font-body theme-transition"
          style={{ color: "rgb(var(--theme-bg) / 0.5)" }}
        >
          &copy; 2026 All rights reserved
        </span>
      </div>
    </section>
  );
}
