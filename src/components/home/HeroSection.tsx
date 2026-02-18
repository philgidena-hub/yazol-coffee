"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { HERO_PRODUCTS } from "@/lib/hero-products";
import WaveDivider from "@/components/ui/WaveDivider";

const springTransition = {
  type: "spring" as const,
  damping: 25,
  stiffness: 80,
};

const imageVariants = {
  enter: { opacity: 0, scale: 0.88, y: 30 },
  center: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.05, y: -20 },
};

const textVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { setTheme } = useTheme();

  const product = HERO_PRODUCTS[current];

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
      setTheme(HERO_PRODUCTS[index].categorySlug);
    },
    [setTheme]
  );

  const next = useCallback(() => {
    const nextIndex = (current + 1) % HERO_PRODUCTS.length;
    goTo(nextIndex);
  }, [current, goTo]);

  // Auto-advance
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

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-bg theme-transition">
      {/* Floating gradient blobs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl theme-transition"
        style={{ background: "rgb(var(--theme-accent))" }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-3xl theme-transition"
        style={{ background: "rgb(var(--theme-accent))" }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-32 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left — Text content */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...springTransition }}
            >
              <span className="inline-block text-gold text-sm tracking-[0.3em] uppercase font-body mb-6 theme-transition">
                Taste the tradition
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={product.slug}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
              transition={{ delay: 0.4, ...springTransition }}
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
                  className="inline-block px-8 py-3.5 border border-cream/30 text-cream font-display text-sm rounded-full hover:border-cream/60 hover:bg-cream/5 transition-all theme-transition"
                >
                  View Menu
                </Link>
              </motion.div>
            </motion.div>

            {/* Reviews indicator */}
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

          {/* Center — Large product image */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
            <div className="relative w-[280px] h-[340px] sm:w-[320px] sm:h-[400px] md:w-[380px] md:h-[460px] lg:w-[420px] lg:h-[520px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={product.slug}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={springTransition}
                  className="absolute inset-0"
                >
                  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 380px, 420px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative ring */}
              <div
                className="absolute -inset-4 rounded-[2rem] border border-gold/10 pointer-events-none theme-transition"
              />
            </div>
          </div>

          {/* Right — Product thumbnails */}
          <div className="lg:col-span-2 order-3 flex lg:flex-col items-center justify-center gap-3 lg:gap-4">
            {HERO_PRODUCTS.map((p, i) => (
              <button
                key={p.slug}
                onClick={() => handleSelect(i)}
                className="relative group"
                aria-label={`Select ${p.name}`}
              >
                <div
                  className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                    i === current
                      ? "ring-2 ring-gold ring-offset-2 ring-offset-bg scale-110"
                      : "opacity-50 hover:opacity-80 hover:scale-105"
                  }`}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                {i === current && (
                  <motion.div
                    layoutId="hero-thumb-ring"
                    className="absolute -inset-1 rounded-xl border-2 border-gold theme-transition"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dot pagination */}
      <div className="absolute bottom-24 md:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className="group relative p-1"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? "bg-gold w-6"
                  : "bg-cream/30 hover:bg-cream/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Wave divider */}
      <div className="text-surface theme-transition">
        <WaveDivider />
      </div>
    </section>
  );
}
