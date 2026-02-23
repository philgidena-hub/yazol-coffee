"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ─── Slide data ─── */
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
    subtitle: "Scoop Stop",
    title: "Coffee & Ice Cream",
    description: "Your neighbourhood spot for brews and scoops",
  },
  {
    image: "/Images/ambiance-2.jpg",
    subtitle: "Order online",
    title: "Skip the line.",
    description: "Order online, pick up fresh on Danforth Ave",
  },
];

const SLIDE_DURATION = 6000;

/* ─── Animated title — word-by-word spring reveal ─── */
function AnimatedTitle({ text, slideIndex }: { text: string; slideIndex: number }) {
  const words = text.split(" ");
  return (
    <h1 className="font-display text-[clamp(2.2rem,7vw,6rem)] leading-[0.95] tracking-[-0.03em] text-white">
      <AnimatePresence mode="wait">
        <motion.span
          key={slideIndex}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
            exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
          }}
          className="inline"
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "120%", rotateX: 50, opacity: 0 },
                  visible: {
                    y: "0%",
                    rotateX: 0,
                    opacity: 1,
                    transition: { type: "spring", damping: 18, stiffness: 90 },
                  },
                  exit: {
                    y: "-80%",
                    opacity: 0,
                    transition: { duration: 0.3, ease: "easeIn" },
                  },
                }}
              >
                {word}
              </motion.span>
              {i < words.length - 1 && "\u00A0"}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
}

/* ─── Scroll indicator ─── */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <span className="text-white/50 text-[10px] font-body tracking-[0.3em] uppercase">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
      />
    </motion.div>
  );
}

/* ─── Main hero ─── */
export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parallax on scroll
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, isPaused, current]);

  const slide = SLIDES[current];

  return (
    <section
      ref={heroRef}
      className="relative h-svh min-h-[550px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background images with Ken Burns ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: SLIDE_DURATION / 1000 + 1.2, ease: "linear" },
          }}
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

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-[1]" />

      {/* ── Content ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-24 sm:pb-28 md:pb-32 px-5 sm:px-6 md:px-12 lg:px-20"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.span
              key={`sub-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block text-white/70 text-[10px] sm:text-xs md:text-sm tracking-[0.3em] uppercase font-body mb-3 sm:mb-4"
            >
              {slide.subtitle}
            </motion.span>
          </AnimatePresence>

          {/* Title — word-by-word */}
          <AnimatedTitle text={slide.title} slideIndex={current} />

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white/60 text-sm sm:text-base md:text-lg font-body max-w-xl mt-4 sm:mt-5 leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </AnimatePresence>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            <Link
              href="/menu"
              className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-brown font-body text-sm tracking-wider uppercase rounded-full overflow-hidden transition-all duration-300 hover:shadow-soft-lg"
            >
              <span className="relative z-10">Order Now</span>
              <svg
                className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border border-white/30 text-white/80 font-body text-sm tracking-wider uppercase rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Our Story
            </Link>
          </motion.div>

          {/* ── Slide indicators ── */}
          <div className="flex items-center gap-2 sm:gap-3 mt-8 sm:mt-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="group relative h-8 flex items-center"
                aria-label={`Go to slide ${i + 1}`}
              >
                <div className="relative w-8 sm:w-12 md:w-16 h-[2px] rounded-full overflow-hidden bg-white/20">
                  {i === current && (
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-white rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: SLIDE_DURATION / 1000,
                        ease: "linear",
                      }}
                      key={`progress-${current}-${i}`}
                    />
                  )}
                  {i < current && (
                    <div className="absolute inset-0 bg-white/50 rounded-full" />
                  )}
                </div>
              </button>
            ))}
            <span className="text-white/40 text-xs font-body ml-1 sm:ml-2 tabular-nums">
              {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Floating badges ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-8 xl:right-16 z-20 flex-col gap-3"
      >
        {["Danforth Ave", "Family Owned", "Est. 2024"].map((badge) => (
          <div
            key={badge}
            className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/70 text-xs font-body tracking-wider"
          >
            {badge}
          </div>
        ))}
      </motion.div>

      {/* ── Scroll indicator ── */}
      <ScrollIndicator />
    </section>
  );
}
