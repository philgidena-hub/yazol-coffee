"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const wordReveal = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const wordChild = {
  hidden: { opacity: 0, y: 20, rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring" as const, damping: 20, stiffness: 100 },
  },
};

function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.h2
      variants={wordReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordChild} className="inline-block mr-[0.3em]">
          {word}
        </motion.span>
      ))}
    </motion.h2>
  );
}

export default function StorySection() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.02]);

  return (
    <section className="relative bg-cream overflow-hidden">
      {/* Main content */}
      <div className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Section label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20 }}
            className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold-dark mb-6"
          >
            Our Story
          </motion.p>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left — story text */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <AnimatedHeading
                text="Where tradition meets heart"
                className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1] tracking-[-0.02em] text-bg mb-8"
              />

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 80 }}
                className="font-body text-bg/60 text-base md:text-lg leading-[1.8] mb-8"
              >
                We&apos;re a small family taking our first steps toward a dream&mdash;making
                a living doing what we love while creating food that feels like home.
                Our kitchen is where tradition meets creativity, bridging cultures
                where flavors spark memories and bring comfort.
              </motion.p>

              {/* Quote */}
              <motion.blockquote
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                className="relative pl-6 border-l-2 border-gold-dark mb-8"
              >
                <p className="font-display text-xl md:text-2xl text-bg/70 italic leading-snug">
                  &ldquo;A customer told us our sponge cake reminded them of their mother&apos;s baking back home.&rdquo;
                </p>
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", damping: 20 }}
              >
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase text-bg/40 hover:text-gold-dark transition-colors duration-300"
                >
                  Read our story
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Right — image with parallax */}
            <div ref={imgRef} className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, type: "spring", damping: 20 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[5/4]"
              >
                <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
                  <Image
                    src="/Images/hero-spread.jpg"
                    alt="Yazol Coffee food spread"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </motion.div>
              </motion.div>

              {/* Small barista image overlapping */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                className="relative -mt-16 md:-mt-24 ml-6 md:ml-12 w-40 md:w-56 rounded-xl overflow-hidden shadow-card border-4 border-cream z-10"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src="/Images/barista.jpg"
                    alt="Yazol barista"
                    fill
                    className="object-cover"
                    sizes="224px"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="grid grid-cols-3 md:grid-cols-4 gap-8 mt-16 md:mt-24 pt-12 border-t border-bg/10"
          >
            {[
              { number: 17, suffix: "+", label: "Menu items" },
              { number: 5, suffix: "", label: "Categories" },
              { number: 1, suffix: "", label: "Family" },
              { number: 2857, suffix: "", label: "Danforth Ave", hideOnMobile: true },
            ].map((stat) => (
              <div key={stat.label} className={stat.hideOnMobile ? "hidden md:block" : ""}>
                <p className="font-display text-3xl md:text-5xl text-bg tabular-nums">
                  <CountUp target={stat.number} suffix={stat.suffix} />
                </p>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/35 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
