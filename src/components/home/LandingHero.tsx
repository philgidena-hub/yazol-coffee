"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { MainCategory } from "@/lib/types";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, delay: 0.3 },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

/* ─── Image map for main categories ─── */
const HERO_IMAGES: Record<string, string> = {
  coffee: "/Hero-coffee.png",
  "scoop-stop": "/Hero-icecream.png",
};

/* ─── Side config by slug ─── */
interface SideConfig {
  bg: string;
  overlay: string;
  tagBg: string;
  tagText: string;
  titleColor: string;
  subtitleColor: string;
  descColor: string;
  btnBg: string;
  btnText: string;
  btnHover: string;
  btnBorder: string;
}

const SIDE_CONFIGS: Record<string, SideConfig> = {
  coffee: {
    bg: "bg-[#1a1209]",
    overlay: "from-[#1a1209]/80 via-[#1a1209]/50 to-transparent",
    tagBg: "bg-white/10 border-white/20",
    tagText: "text-white/70",
    titleColor: "text-white",
    subtitleColor: "text-amber-300",
    descColor: "text-white/60",
    btnBg: "bg-transparent",
    btnText: "text-amber-200",
    btnHover: "hover:bg-amber-200 hover:text-[#1a1209]",
    btnBorder: "border-amber-200/70",
  },
  "scoop-stop": {
    bg: "bg-[#f8d7e0]",
    overlay: "from-[#f8d7e0]/80 via-[#f8d7e0]/50 to-transparent",
    tagBg: "bg-pink-500/10 border-pink-300/30",
    tagText: "text-pink-600/70",
    titleColor: "text-gray-800",
    subtitleColor: "text-pink-500",
    descColor: "text-gray-600/70",
    btnBg: "bg-gradient-to-r from-pink-300 to-pink-400",
    btnText: "text-white",
    btnHover: "hover:from-pink-400 hover:to-pink-500",
    btnBorder: "border-transparent",
  },
};

const DEFAULT_CONFIG = SIDE_CONFIGS["coffee"];

/* ─── Default descriptions ─── */
const DESCRIPTIONS: Record<string, string> = {
  coffee: "Rich aroma. Bold flavor. Perfectly brewed.",
  "scoop-stop": "Creamy, dreamy, made to delight.",
};

/* ─── Main component ─── */
interface LandingHeroProps {
  mainCategories: MainCategory[];
}

export default function LandingHero({ mainCategories }: LandingHeroProps) {
  const [address, setAddress] = useState("2857 Danforth Ave, Toronto");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.address) {
          const parts = [data.address, data.city].filter(Boolean);
          setAddress(parts.join(", "));
        }
      })
      .catch(() => {});
  }, []);

  // Ensure we have exactly 2 categories for the split layout
  // Fall back to a single full-width layout if not
  const hasTwoSides = mainCategories.length >= 2;

  return (
    <section className="relative w-full min-h-svh flex flex-col md:flex-row overflow-hidden">
      {mainCategories.slice(0, 2).map((mc, idx) => {
        const config = SIDE_CONFIGS[mc.slug] || DEFAULT_CONFIG;
        const heroImage = HERO_IMAGES[mc.slug] || "/Images/hero-spread.jpg";
        const description = DESCRIPTIONS[mc.slug] || mc.subtitle;
        const isLeft = idx === 0;

        return (
          <motion.div
            key={mc.slug}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className={`relative ${hasTwoSides ? "md:w-1/2" : "w-full"} min-h-[50svh] md:min-h-svh flex flex-col items-start justify-start ${config.bg} overflow-hidden`}
          >
            {/* Background image — positioned to show product at bottom */}
            <motion.div variants={fadeIn} className="absolute inset-0">
              <Image
                src={heroImage}
                alt={mc.name}
                fill
                className="object-cover object-bottom"
                sizes={hasTwoSides ? "50vw" : "100vw"}
                priority
              />
              {/* Gradient overlay — strong at top for text, fading to transparent at bottom to reveal product */}
              <div
                className="absolute inset-0"
                style={{
                  background: isLeft
                    ? "linear-gradient(to bottom, #1a1209 0%, rgba(26,18,9,0.85) 25%, rgba(26,18,9,0.4) 50%, transparent 70%)"
                    : "linear-gradient(to bottom, #f8d7e0 0%, rgba(248,215,224,0.85) 25%, rgba(248,215,224,0.4) 50%, transparent 70%)",
                }}
              />
            </motion.div>

            {/* Content — positioned at top-left, not centered */}
            <div className={`relative z-10 flex flex-col ${isLeft ? "items-start text-left" : "items-start text-left"} px-8 sm:px-12 md:px-10 lg:px-14 xl:px-20 pt-28 md:pt-32 lg:pt-36 max-w-xl`}>
              {/* Subtitle — italic script style */}
              <motion.p
                variants={fadeUp}
                className={`font-display italic text-lg sm:text-xl md:text-2xl mb-1 ${config.subtitleColor}`}
              >
                {isLeft ? "Freshly Roasted" : "Handcrafted"}
              </motion.p>

              {/* Title */}
              <motion.h1
                variants={fadeUp}
                className={`font-display text-5xl sm:text-6xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight font-bold mb-4 leading-[0.95] ${config.titleColor}`}
              >
                {mc.name.toUpperCase()}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className={`font-body text-sm sm:text-base mb-8 max-w-xs ${config.descColor}`}
              >
                {description}
              </motion.p>

              {/* CTA Button */}
              <motion.div variants={fadeUp}>
                <Link
                  href={`/menu?section=${mc.slug}`}
                  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full border text-xs sm:text-sm font-body tracking-[0.2em] uppercase transition-all duration-300 ${config.btnBg} ${config.btnText} ${config.btnHover} ${config.btnBorder}`}
                >
                  Explore {mc.name}
                </Link>
              </motion.div>
            </div>

            {/* Wave divider — only on the left panel, desktop only */}
            {isLeft && hasTwoSides && (
              <div className="hidden md:block absolute top-0 right-0 h-full w-24 lg:w-32 xl:w-40 z-20 translate-x-1/2">
                <svg
                  viewBox="0 0 120 800"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                  fill="#f8d7e0"
                >
                  <path d="M120,0 L120,800 L60,800 C80,700 20,600 40,500 C60,400 10,300 40,200 C70,100 30,50 60,0 Z" />
                </svg>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Bottom bar with address — floating on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center py-4 md:py-5"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-soft-md border border-black/5">
          <svg
            className="w-3.5 h-3.5 text-brown/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-brown/60 text-xs font-body">{address}</span>
        </div>
      </motion.div>
    </section>
  );
}
