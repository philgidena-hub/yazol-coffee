"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    image: "/Images/storefront-wide.jpg",
    subtitle: "Welcome to",
    title: "Yazol Coffee",
    description: "East African flavors in the heart of Toronto",
  },
  {
    image: "/Images/hero-spread.jpg",
    subtitle: "Crafted with love",
    title: "A taste of home.",
    description: "Authentic dishes passed down through generations",
  },
  {
    image: "/Images/coffee-1.jpg",
    subtitle: "Traditional brew",
    title: "Jebena Buna",
    description: "Ethiopian coffee ceremony, brewed fresh for you",
  },
  {
    image: "/Images/ambiance-1.jpg",
    subtitle: "Warm & inviting",
    title: "Your neighborhood spot.",
    description: "Order online, pick up on Danforth Ave",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ["0%", "20%"]);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  // Pause on interaction
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  };

  const slide = SLIDES[current];

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[700px] overflow-hidden bg-bg">
      {/* Background slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={current === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/30" />
      <div className="absolute inset-0 bg-bg/20" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-4xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block text-gold text-sm tracking-[0.3em] uppercase font-body mb-6">
              {slide.subtitle}
            </span>

            <h1 className="font-display text-display-lg text-cream leading-[0.95] mb-6">
              {slide.title}
            </h1>

            <p className="text-cream-muted text-lg md:text-xl font-body max-w-lg leading-relaxed mb-10">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Link
              href="/menu"
              className="inline-block px-8 py-3.5 bg-gold text-bg font-display text-sm rounded-full hover:bg-gold-light transition-colors"
            >
              Order Now
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Link
              href="#menu"
              className="inline-block px-8 py-3.5 border border-cream/30 text-cream font-display text-sm rounded-full hover:border-cream/60 hover:bg-cream/5 transition-all"
            >
              View Menu
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-6 md:left-12 lg:left-20 z-20 flex items-center gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
            className="group relative h-10 flex items-center"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="relative w-12 h-[2px] bg-cream/20 overflow-hidden rounded-full">
              {i === current && (
                <motion.div
                  key={`progress-${current}`}
                  className="absolute inset-y-0 left-0 bg-gold"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
              {i < current && <div className="absolute inset-0 bg-cream/40" />}
            </div>
          </button>
        ))}
        <span className="text-cream/40 text-xs font-body ml-2 tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* Floating accent badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[22%] right-[10%] glass px-5 py-2.5 rounded-full"
        >
          <span className="text-gold text-xs font-body tracking-wider">Danforth Ave</span>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[58%] right-[6%] glass px-5 py-2.5 rounded-full"
        >
          <span className="text-cream text-xs font-body tracking-wider">Family Owned</span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-2"
      >
        <span className="text-cream-muted text-[10px] tracking-[0.3em] uppercase font-body">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
