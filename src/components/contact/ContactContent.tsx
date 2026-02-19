"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal, FadeUp } from "@/components/ui/TextReveal";

const HOURS = [
  { days: "Monday — Friday", time: "8:00 AM — 6:00 PM" },
  { days: "Saturday — Sunday", time: "9:00 AM — 5:00 PM" },
];

export default function ContactContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <main>
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-[60svh] min-h-[400px] overflow-hidden">
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 scale-[1.15]">
          <Image
            src="/Images/storefront-wide.jpg"
            alt="Yazol Coffee storefront"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-bg/50 via-bg/30 to-bg" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-14 md:pb-20 max-w-7xl mx-auto"
        >
          <LineReveal>
            <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold mb-4">
              Get in Touch
            </p>
          </LineReveal>
          <TextReveal
            as="h1"
            className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-[-0.02em] text-cream"
            delay={0.1}
          >
            We&apos;d love to hear from you
          </TextReveal>
        </motion.div>
      </section>

      {/* ── Contact grid ── */}
      <section className="bg-cream py-20 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
          {/* Left — intro */}
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="font-display text-[clamp(1.3rem,2.5vw,2rem)] leading-[1.3] text-bg/85 text-balance">
                Whether you have a question, want to cater an event, or just
                want to say hi&mdash;reach out. We&apos;re always happy to
                connect.
              </p>
            </FadeUp>

            {/* Social links */}
            <FadeUp delay={0.2}>
              <div className="mt-10 flex items-center gap-4">
                <Link
                  href="https://instagram.com/yazolcoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-bg/10 flex items-center justify-center text-bg/40 hover:border-gold-dark hover:text-gold-dark transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </Link>
                <Link
                  href="https://tiktok.com/@yazolcoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-bg/10 flex items-center justify-center text-bg/40 hover:border-gold-dark hover:text-gold-dark transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49l.01-7.1a8.28 8.28 0 004.86 1.56v-3.45a4.85 4.85 0 01-1.15.49z" />
                  </svg>
                </Link>
              </div>
            </FadeUp>
          </div>

          {/* Right — details */}
          <div className="lg:col-span-6 lg:col-start-7 space-y-0">
            {/* Address */}
            <FadeUp>
              <div className="py-8 border-b border-bg/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-3">
                      Address
                    </p>
                    <p className="font-display text-2xl md:text-3xl text-bg">
                      2857 Danforth Ave
                    </p>
                    <p className="font-body text-bg/50 mt-1">
                      Toronto, ON M4C 1M2
                    </p>
                  </div>
                  <Link
                    href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[10px] tracking-[0.15em] uppercase text-gold-dark hover:text-bg transition-colors flex items-center gap-1 mt-1"
                  >
                    Directions
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 17L17 7M17 7H7M17 7v10"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </FadeUp>

            {/* Hours */}
            <FadeUp delay={0.1}>
              <div className="py-8 border-b border-bg/10">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">
                  Hours
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {HOURS.map((h) => (
                    <div key={h.days}>
                      <p className="font-display text-xl md:text-2xl text-bg">
                        {h.days}
                      </p>
                      <p className="font-body text-gold-dark mt-1">{h.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Phone + Email */}
            <FadeUp delay={0.2}>
              <div className="py-8 border-b border-bg/10">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">
                  Phone
                </p>
                <Link
                  href="tel:+14166905423"
                  className="font-display text-2xl md:text-3xl text-bg hover:text-gold-dark transition-colors"
                >
                  (416) 690-5423
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.25}>
              <div className="py-8">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/30 mb-4">
                  Email
                </p>
                <Link
                  href="mailto:yazolcoffee@gmail.com"
                  className="font-display text-xl md:text-2xl text-bg hover:text-gold-dark transition-colors break-all"
                >
                  yazolcoffee@gmail.com
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Map / Storefront image ── */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/Images/storefront.jpg"
          alt="Yazol Coffee storefront on Danforth Ave"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/30" />

        {/* Floating card */}
        <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 lg:left-20 z-10">
          <FadeUp>
            <div className="glass rounded-2xl px-6 py-5 md:px-8 md:py-6 max-w-sm">
              <p className="font-display text-lg md:text-xl text-cream mb-1">
                2857 Danforth Ave
              </p>
              <p className="font-body text-cream/50 text-sm mb-4">
                Scarborough, Toronto
              </p>
              <Link
                href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-sm font-body tracking-wide hover:text-gold-light transition-colors"
              >
                Open in Maps
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7v10"
                  />
                </svg>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-bg py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="font-display text-[clamp(1.5rem,3vw,3rem)] leading-[1] text-cream mb-4">
              Ready for a cup?
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="font-body text-cream/40 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
              Skip the wait. Order online and pick up fresh at our Danforth Ave
              location.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/menu"
                  className="inline-block px-8 py-4 bg-gold text-bg font-body text-sm tracking-wider uppercase rounded-full hover:bg-gold-light transition-colors shadow-gold-md"
                >
                  Order for Pickup
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="tel:+14166905423"
                  className="inline-block px-8 py-4 border border-cream/20 text-cream font-body text-sm tracking-wider uppercase rounded-full hover:border-cream/50 transition-colors"
                >
                  Call Us
                </Link>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
