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
      // ease out cubic
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

const quoteWords = "A customer told us our sponge cake reminded them of their mother\u2019s baking back home.".split(" ");

export default function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="relative bg-bg overflow-hidden">
      {/* Full-width barista parallax */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.3]">
          <Image
            src="/Images/barista.jpg"
            alt="Yazol Coffee barista"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />

        {/* Overlay text */}
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

      {/* Story text - white section */}
      <div className="bg-cream py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
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

          <div>
            {/* Staggered word-by-word quote reveal */}
            <motion.blockquote
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
              }}
              className="relative pl-8 border-l-2 border-gold mb-10"
            >
              <p className="font-display text-2xl md:text-3xl text-bg/80 italic leading-snug">
                &ldquo;
                {quoteWords.map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden align-bottom">
                    <motion.span
                      className="inline-block"
                      variants={{
                        hidden: { y: "100%", opacity: 0 },
                        visible: {
                          y: "0%",
                          opacity: 1,
                          transition: { type: "spring", damping: 20, stiffness: 100 },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                    {i < quoteWords.length - 1 && "\u00A0"}
                  </span>
                ))}
                &rdquo;
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
              care&mdash;every dish tells a story. The love and warmth in our home
              reaches your home.
            </motion.p>

            {/* Stats with count-up */}
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
    </section>
  );
}
