"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal } from "@/components/ui/TextReveal";

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

export default function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="relative bg-bg overflow-hidden">
      {/* Hero image with parallax */}
      <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.3]">
          <Image
            src="/Images/coffee-station.jpg"
            alt="Yazol Coffee preparation"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />

        {/* Overlay heading */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-16">
          <div className="max-w-7xl mx-auto">
            <LineReveal>
              <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold mb-4">
                Our Story
              </p>
            </LineReveal>
            <TextReveal
              as="h2"
              className="font-display text-[clamp(2rem,5vw,5rem)] leading-[0.9] tracking-[-0.02em] text-cream"
              delay={0.1}
            >
              Where tradition meets heart
            </TextReveal>
          </div>
        </div>
      </div>

      {/* Story content */}
      <div className="bg-cream py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
            {/* Left — story text */}
            <div className="lg:col-span-5">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", damping: 20, stiffness: 80 }}
                className="font-body text-bg/70 text-lg md:text-xl leading-[1.8]"
              >
                We&apos;re a small family taking our first steps toward a dream&mdash;making
                a living doing what we love while creating food that feels like home.
                Our kitchen is where tradition meets creativity, bridging cultures
                where flavors spark memories and bring comfort.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                className="mt-10"
              >
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase text-bg/40 hover:text-bg transition-colors"
                >
                  Read our story
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Right — images + quote */}
            <div className="lg:col-span-7">
              {/* Image mosaic */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, type: "spring", damping: 20 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden"
                >
                  <Image
                    src="/Images/ambiance-2.jpg"
                    alt="Yazol ambiance"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", damping: 20 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-8"
                >
                  <Image
                    src="/Images/culture-decor.jpg"
                    alt="Cultural decor"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </motion.div>
              </div>

              {/* Quote */}
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="relative pl-8 border-l-2 border-gold mb-10"
              >
                <p className="font-display text-2xl md:text-3xl text-bg/80 italic leading-snug">
                  &ldquo;A customer told us our sponge cake reminded them of their mother&apos;s baking back home.&rdquo;
                </p>
              </motion.blockquote>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                className="font-body text-bg/60 text-lg leading-[1.8]"
              >
                Whether it&apos;s Erteb that reminds us of busy mornings, Ambasha
                passed down through generations, or Jebena Buna brewed with
                care&mdash;every dish tells a story.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", damping: 20 }}
                className="grid grid-cols-3 gap-8 mt-12 pt-10 border-t border-bg/10"
              >
                {[
                  { number: 17, suffix: "+", label: "Menu items" },
                  { number: 5, suffix: "", label: "Categories" },
                  { number: 1, suffix: "", label: "Family" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-4xl md:text-5xl text-bg">
                      <CountUp target={stat.number} suffix={stat.suffix} />
                    </p>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-bg/40 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
