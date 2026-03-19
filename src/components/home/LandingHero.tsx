"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { MainCategory } from "@/lib/types";

/* ─── Icons ─── */
function CoffeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 110 8h-1" />
      <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

function IceCreamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 015 5v1H7V7a5 5 0 015-5z" />
      <path d="M7 8l5 14 5-14" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  coffee: CoffeeIcon,
  "ice-cream": IceCreamIcon,
};

/** Map accent color → decorative blob class + icon container + bullet + CTA text */
const ACCENT_STYLES: Record<string, { blob: string; iconBg: string; iconText: string; bullet: string; cta: string; ctaHover: string; subtitleText: string }> = {
  brown: {
    blob: "bg-brown-warm/15",
    iconBg: "bg-surface-light",
    iconText: "text-brown",
    bullet: "bg-brown-warm",
    cta: "text-brown",
    ctaHover: "group-hover:text-gold",
    subtitleText: "text-gold",
  },
  "teal-600": {
    blob: "bg-teal-100/40",
    iconBg: "bg-teal-50",
    iconText: "text-teal-600",
    bullet: "bg-teal-400",
    cta: "text-teal-600",
    ctaHover: "group-hover:text-teal-700",
    subtitleText: "text-teal-600",
  },
  "indigo-600": {
    blob: "bg-indigo-100/40",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    bullet: "bg-indigo-400",
    cta: "text-indigo-600",
    ctaHover: "group-hover:text-indigo-700",
    subtitleText: "text-indigo-600",
  },
  "rose-600": {
    blob: "bg-rose-100/40",
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    bullet: "bg-rose-400",
    cta: "text-rose-600",
    ctaHover: "group-hover:text-rose-700",
    subtitleText: "text-rose-600",
  },
  "amber-600": {
    blob: "bg-amber-100/40",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    bullet: "bg-amber-400",
    cta: "text-amber-600",
    ctaHover: "group-hover:text-amber-700",
    subtitleText: "text-amber-600",
  },
  "emerald-600": {
    blob: "bg-emerald-100/40",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    bullet: "bg-emerald-400",
    cta: "text-emerald-600",
    ctaHover: "group-hover:text-emerald-700",
    subtitleText: "text-emerald-600",
  },
};

const DEFAULT_ACCENT = ACCENT_STYLES["brown"];

/* ─── Stagger animation variants ─── */
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─── Main component ─── */
interface LandingHeroProps {
  mainCategories: MainCategory[];
}

export default function LandingHero({ mainCategories }: LandingHeroProps) {
  const [address, setAddress] = useState("2857 Danforth Ave, Toronto");
  const [hours, setHours] = useState("Open 7am - 10pm Daily");

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

  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden px-5 sm:px-6 md:px-12 lg:px-20 pt-24 pb-8 sm:pt-28 sm:pb-10">
      {/* ── Gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8e8d8] via-[#faf0e8] to-[#e8f0e8]" />

      {/* ── Decorative blobs ── */}
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-tl from-green-100/30 to-teal-100/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brown/10 bg-white/60 backdrop-blur-sm shadow-soft-sm mb-4 sm:mb-5"
        >
          <SparkleIcon className="w-3.5 h-3.5 text-gold" />
          <span className="text-brown/70 text-xs font-body tracking-wide">
            Ethiopian Heritage, Modern Experience
          </span>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-display-lg sm:text-display-xl text-plum mb-2 sm:mb-3"
        >
          Yazol
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          variants={fadeUp}
          className="font-display text-display-sm text-brown mb-3 sm:mb-4 text-center"
        >
          {mainCategories.map((mc, i) => (
            <span key={mc.slug}>
              {i > 0 && " & "}
              {mc.name}
            </span>
          ))}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-brown/50 text-sm sm:text-base font-body max-w-lg text-center leading-relaxed mb-8 sm:mb-10"
        >
          Where Ethiopian coffee tradition meets artisan ice cream. Choose your experience below.
        </motion.p>

        {/* ── Dynamic cards ── */}
        <motion.div
          variants={fadeUp}
          className={`grid grid-cols-1 ${mainCategories.length > 1 ? "md:grid-cols-2" : ""} gap-5 sm:gap-6 w-full`}
        >
          {mainCategories.map((mc) => {
            const Icon = ICON_MAP[mc.iconType] || CoffeeIcon;
            const styles = ACCENT_STYLES[mc.accentColor] || DEFAULT_ACCENT;

            return (
              <Link key={mc.slug} href={`/menu?section=${mc.slug}`} className="block">
                <motion.div
                  variants={cardVariant}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="group relative bg-white rounded-2xl p-5 sm:p-7 shadow-card hover:shadow-card-hover transition-shadow duration-500 overflow-hidden h-full"
                >
                  {/* Decorative blob */}
                  <div className={`absolute -top-6 -right-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full ${styles.blob}`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl ${styles.iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${styles.iconText}`} />
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl sm:text-2xl text-brown mb-1">
                      {mc.name}
                    </h3>
                    <p className={`${styles.subtitleText} text-sm font-body tracking-wide mb-3`}>
                      {mc.subtitle}
                    </p>

                    {/* CTA */}
                    <span className={`inline-flex items-center gap-2 ${styles.cta} font-body text-sm font-semibold tracking-wide ${styles.ctaHover} transition-colors`}>
                      Order Now
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* ── Bottom info ── */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 sm:mt-10"
        >
          <div className="flex items-center gap-2 text-brown/40">
            <LocationIcon className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-body">{address}</span>
          </div>
          <div className="flex items-center gap-2 text-brown/40">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-body">{hours}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
