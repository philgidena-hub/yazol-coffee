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
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative bg-cream overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 pt-28 md:pt-40 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <LineReveal>
            <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold-dark mb-5">
              Our Story
            </p>
          </LineReveal>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-px bg-gold origin-left mb-8"
          />
          <TextReveal
            as="h2"
            className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.85] tracking-[-0.02em] text-bg max-w-4xl"
            delay={0.1}
          >
            Where tradition meets heart
          </TextReveal>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-20 pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left — Large image with floating accent */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", damping: 20, stiffness: 80 }}
              className="lg:col-span-7 relative"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.15]">
                  <Image
                    src="/Images/coffee-station.jpg"
                    alt="Yazol Coffee preparation"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </motion.div>
              </div>
              {/* Floating accent image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                className="absolute -bottom-6 -right-4 md:bottom-8 md:-right-8 w-32 h-40 md:w-44 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-cream hidden md:block"
              >
                <Image
                  src="/Images/culture-decor.jpg"
                  alt="Cultural decor"
                  fill
                  className="object-cover"
                  sizes="180px"
                />
              </motion.div>
            </motion.div>

            {/* Right — Text content */}
            <div className="lg:col-span-5 flex flex-col justify-center">
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

              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="relative pl-8 border-l-2 border-gold my-10"
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", damping: 20 }}
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

              {/* Mobile image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-12 md:hidden"
              >
                <Image
                  src="/Images/culture-decor.jpg"
                  alt="Cultural decor"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="grid grid-cols-3 gap-8 mt-20 md:mt-28 pt-12 border-t border-bg/10"
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
    </section>
  );
}
