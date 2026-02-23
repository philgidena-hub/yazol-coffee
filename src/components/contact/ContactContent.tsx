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

const detailVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      damping: 20,
      stiffness: 80,
    },
  }),
};

export default function ContactContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const storeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: storeProgress } = useScroll({
    target: storeRef,
    offset: ["start end", "end start"],
  });
  const storeY = useTransform(storeProgress, [0, 1], [30, -30]);
  const storeScale = useTransform(storeProgress, [0, 0.5], [1.05, 1]);

  return (
    <main>
      {/* Hero */}
      <section ref={heroRef} className="relative h-[55svh] sm:h-[60svh] min-h-[380px] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-6 md:px-12 lg:px-20 pb-10 sm:pb-14 md:pb-20 max-w-7xl mx-auto"
        >
          <LineReveal>
            <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/80 mb-3 sm:mb-4">
              Get in Touch
            </p>
          </LineReveal>
          <TextReveal
            as="h1"
            className="font-display text-[clamp(2rem,6vw,5rem)] leading-[0.9] tracking-[-0.02em] text-white"
            delay={0.1}
          >
            We&apos;d love to hear from you
          </TextReveal>
        </motion.div>
      </section>

      {/* Contact grid */}
      <section className="bg-white py-16 sm:py-20 md:py-32 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12">
          {/* Left — intro */}
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="font-display text-[clamp(1.2rem,2.5vw,2rem)] leading-[1.35] text-brown text-balance">
                Whether you have a question, want to cater an event, or just
                want to say hi&mdash;reach out. We&apos;re always happy to
                connect.
              </p>
            </FadeUp>

            {/* Social links */}
            <FadeUp delay={0.2}>
              <div className="mt-8 sm:mt-10 flex items-center gap-3 sm:gap-4">
                <Link
                  href="https://instagram.com/yazolcoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-black/10 flex items-center justify-center text-brown/40 hover:border-gold hover:text-gold transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </Link>
                <Link
                  href="https://tiktok.com/@yazolcoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-black/10 flex items-center justify-center text-brown/40 hover:border-gold hover:text-gold transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49l.01-7.1a8.28 8.28 0 004.86 1.56v-3.45a4.85 4.85 0 01-1.15.49z" />
                  </svg>
                </Link>
              </div>
            </FadeUp>

            {/* Quick info card for mobile */}
            <FadeUp delay={0.3}>
              <div className="mt-8 p-5 sm:p-6 rounded-xl bg-surface-light lg:hidden">
                <p className="font-display text-lg text-brown mb-1">Yazol Coffee</p>
                <p className="font-body text-brown/50 text-sm">2857 Danforth Ave, Toronto</p>
                <div className="flex items-center gap-4 mt-3">
                  <Link href="tel:+14166905423" className="text-gold text-sm font-body hover:text-gold-dark transition-colors">
                    Call us
                  </Link>
                  <Link
                    href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold text-sm font-body hover:text-gold-dark transition-colors"
                  >
                    Directions
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Right — details */}
          <motion.div
            className="lg:col-span-6 lg:col-start-7 space-y-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <motion.div custom={0} variants={detailVariants} className="py-6 sm:py-8 border-b border-black/8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-2 sm:mb-3">
                    Address
                  </p>
                  <p className="font-display text-xl sm:text-2xl md:text-3xl text-brown">
                    2857 Danforth Ave
                  </p>
                  <p className="font-body text-brown/50 mt-1 text-sm">
                    Toronto, ON M4C 1M2
                  </p>
                </div>
                <Link
                  href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[10px] tracking-[0.15em] uppercase text-gold hover:text-brown transition-colors flex items-center gap-1 mt-1 flex-shrink-0"
                >
                  Directions
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            <motion.div custom={1} variants={detailVariants} className="py-6 sm:py-8 border-b border-black/8">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-3 sm:mb-4">
                Hours
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {HOURS.map((h) => (
                  <div key={h.days}>
                    <p className="font-display text-lg sm:text-xl md:text-2xl text-brown">
                      {h.days}
                    </p>
                    <p className="font-body text-gold mt-1 text-sm">{h.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div custom={2} variants={detailVariants} className="py-6 sm:py-8 border-b border-black/8">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-3 sm:mb-4">
                Phone
              </p>
              <Link
                href="tel:+14166905423"
                className="font-display text-xl sm:text-2xl md:text-3xl text-brown hover:text-gold transition-colors"
              >
                (416) 690-5423
              </Link>
            </motion.div>

            <motion.div custom={3} variants={detailVariants} className="py-6 sm:py-8">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brown/40 mb-3 sm:mb-4">
                Email
              </p>
              <Link
                href="mailto:yazolcoffee@gmail.com"
                className="font-display text-lg sm:text-xl md:text-2xl text-brown hover:text-gold transition-colors break-all"
              >
                yazolcoffee@gmail.com
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Storefront image with parallax */}
      <section ref={storeRef} className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.div style={{ y: storeY, scale: storeScale }} className="absolute inset-0">
          <Image
            src="/Images/storefront.jpg"
            alt="Yazol Coffee storefront on Danforth Ave"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-5 sm:left-6 md:left-12 lg:left-20 z-10">
          <FadeUp>
            <div className="glass rounded-xl sm:rounded-2xl px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 max-w-sm">
              <p className="font-display text-base sm:text-lg md:text-xl text-brown mb-1">
                2857 Danforth Ave
              </p>
              <p className="font-body text-brown/50 text-xs sm:text-sm mb-3 sm:mb-4">
                Scarborough, Toronto
              </p>
              <Link
                href="https://maps.google.com/?q=2857+Danforth+Ave+Toronto"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-sm font-body tracking-wide hover:text-gold-dark transition-colors"
              >
                Open in Maps
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg py-20 sm:py-24 md:py-32 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <TextReveal
            as="h2"
            className="font-display text-[clamp(1.3rem,3vw,3rem)] leading-[1.1] text-brown mb-3 sm:mb-4"
          >
            Ready for a cup?
          </TextReveal>
          <FadeUp delay={0.1}>
            <p className="font-body text-brown/50 text-sm md:text-base max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed">
              Skip the wait. Order online and pick up fresh at our Danforth Ave
              location.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/menu"
                  className="inline-block w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 bg-brown text-white font-body text-sm tracking-wider uppercase rounded-full hover:bg-brown-light transition-colors"
                >
                  Order for Pickup
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="tel:+14166905423"
                  className="inline-block w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 border border-brown/20 text-brown font-body text-sm tracking-wider uppercase rounded-full hover:border-brown/40 transition-colors"
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
