"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal, FadeUp } from "@/components/ui/TextReveal";

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

const statVariants = {
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

export default function StorySection() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.02]);

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Main content */}
      <div className="px-5 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Section label */}
          <LineReveal>
            <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold mb-4 sm:mb-6">
              Our Story
            </p>
          </LineReveal>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
            {/* Left — story text */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <TextReveal
                as="h2"
                className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[1] tracking-[-0.02em] text-brown mb-6 sm:mb-8"
              >
                Where tradition meets heart
              </TextReveal>

              <FadeUp delay={0.2}>
                <p className="font-body text-brown/60 text-sm sm:text-base md:text-lg leading-[1.8] mb-6 sm:mb-8">
                  We&apos;re a small family taking our first steps toward a dream&mdash;making
                  a living doing what we love while creating food that feels like home.
                  Our kitchen is where tradition meets creativity, bridging cultures
                  where flavors spark memories and bring comfort.
                </p>
              </FadeUp>

              {/* Quote */}
              <motion.blockquote
                initial={{ opacity: 0, x: -30, scaleX: 0.3 }}
                whileInView={{ opacity: 1, x: 0, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 20, stiffness: 70 }}
                className="relative pl-5 sm:pl-6 border-l-2 border-gold mb-6 sm:mb-8 origin-left"
              >
                <p className="font-display text-lg sm:text-xl md:text-2xl text-brown/70 italic leading-snug">
                  &ldquo;A customer told us our sponge cake reminded them of their mother&apos;s baking back home.&rdquo;
                </p>
              </motion.blockquote>

              <FadeUp delay={0.4}>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase text-brown/50 hover:text-gold transition-colors duration-300"
                >
                  Read our story
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </FadeUp>
            </div>

            {/* Right — image with parallax */}
            <div ref={imgRef} className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, clipPath: "inset(8% 8% 8% 8% round 16px)" }}
                whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[5/4]"
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
                transition={{ delay: 0.4, type: "spring", damping: 20 }}
                className="relative -mt-12 sm:-mt-16 md:-mt-24 ml-4 sm:ml-6 md:ml-12 w-32 sm:w-40 md:w-56 rounded-lg sm:rounded-xl overflow-hidden shadow-soft-lg border-[3px] sm:border-4 border-white z-10"
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16 md:mt-24 pt-10 sm:pt-12 border-t border-black/10"
          >
            {[
              { number: 17, suffix: "+", label: "Menu items" },
              { number: 5, suffix: "", label: "Categories" },
              { number: 1, suffix: "", label: "Family" },
              { number: 2857, suffix: "", label: "Danforth Ave", hideOnMobile: true },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={statVariants}
                className={stat.hideOnMobile ? "hidden md:block" : ""}
              >
                <p className="font-display text-2xl sm:text-3xl md:text-5xl text-brown tabular-nums">
                  <CountUp target={stat.number} suffix={stat.suffix} />
                </p>
                <p className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-brown/40 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
