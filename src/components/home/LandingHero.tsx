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
  coffee: "/Images/barista.jpg",
  "scoop-stop": "/Images/coffee-1.jpg",
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
    overlay: "from-[#1a1209]/90 via-[#1a1209]/70 to-[#1a1209]/40",
    tagBg: "bg-white/10 border-white/20",
    tagText: "text-white/70",
    titleColor: "text-white",
    subtitleColor: "text-amber-300",
    descColor: "text-white/60",
    btnBg: "bg-transparent",
    btnText: "text-amber-300",
    btnHover: "hover:bg-amber-300 hover:text-[#1a1209]",
    btnBorder: "border-amber-300/60",
  },
  "scoop-stop": {
    bg: "bg-[#fce4ec]",
    overlay: "from-[#fce4ec]/90 via-[#fce4ec]/70 to-[#fce4ec]/40",
    tagBg: "bg-pink-500/10 border-pink-300/30",
    tagText: "text-pink-600/70",
    titleColor: "text-gray-800",
    subtitleColor: "text-pink-500",
    descColor: "text-gray-600/70",
    btnBg: "bg-gradient-to-r from-pink-400 to-pink-500",
    btnText: "text-white",
    btnHover: "hover:from-pink-500 hover:to-pink-600",
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
            className={`relative ${hasTwoSides ? "md:w-1/2" : "w-full"} min-h-[50svh] md:min-h-svh flex flex-col items-center justify-center ${config.bg} overflow-hidden`}
          >
            {/* Background image */}
            <motion.div variants={fadeIn} className="absolute inset-0">
              <Image
                src={heroImage}
                alt={mc.name}
                fill
                className="object-cover"
                sizes={hasTwoSides ? "50vw" : "100vw"}
                priority
              />
              {/* Overlay gradient */}
              <div className={`absolute inset-0 bg-gradient-to-t ${config.overlay}`} />
              {/* Extra bottom gradient for text readability */}
              <div className={`absolute inset-0 bg-gradient-to-b ${config.overlay}`} />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 md:px-12 lg:px-16 py-20 md:py-0 max-w-lg mx-auto">
              {/* Tag */}
              <motion.div
                variants={fadeUp}
                className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[11px] tracking-widest uppercase font-body mb-5 ${config.tagBg} ${config.tagText}`}
              >
                {isLeft ? "Freshly Roasted" : "Handcrafted"}
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeUp}
                className={`font-display text-5xl sm:text-6xl md:text-5xl lg:text-7xl tracking-tight mb-3 ${config.titleColor}`}
              >
                {mc.name.toUpperCase()}
              </motion.h1>

              {/* Subtitle */}
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
                  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full border text-sm font-display tracking-wide transition-all duration-300 ${config.btnBg} ${config.btnText} ${config.btnHover} ${config.btnBorder}`}
                >
                  Explore {mc.name}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Wave divider — only on the left panel, desktop only */}
            {isLeft && hasTwoSides && (
              <div className="hidden md:block absolute top-0 right-0 h-full w-20 lg:w-28 z-20 translate-x-1/2">
                <svg
                  viewBox="0 0 100 800"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                  fill={mc.slug === "coffee" ? "#1a1209" : "#fce4ec"}
                >
                  <path d="M100,0 L100,800 L0,800 C30,650 70,550 30,400 C-10,250 50,150 30,0 Z" />
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
