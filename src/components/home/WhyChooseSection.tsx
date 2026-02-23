"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TextReveal from "@/components/ui/TextReveal";
import { LineReveal } from "@/components/ui/TextReveal";

const VALUES = [
  {
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Authentic Origins",
    description:
      "Our coffee beans are sourced directly from Ethiopian highlands, bringing you the authentic taste of where coffee was born.",
  },
  {
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Made Fresh Daily",
    description:
      "Every pastry, samosa, and scoop is prepared fresh each day. We never compromise on quality or freshness.",
  },
  {
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Easy Ordering",
    description:
      "Browse our menu, add to cart, and pick up at our Danforth Ave location. Quick, convenient, and ready in minutes.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      type: "spring" as const,
      damping: 20,
      stiffness: 80,
    },
  }),
};

export default function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-28 bg-bg overflow-hidden">
      {/* Subtle parallax background accent */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-gold/[0.03] blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <LineReveal>
            <span className="text-gold text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase font-body mb-2 sm:mb-3 block">
              Why Yazol
            </span>
          </LineReveal>
          <TextReveal
            as="h2"
            className="font-display text-display-sm text-brown"
            delay={0.1}
          >
            Why Choose Yazol?
          </TextReveal>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 md:gap-8"
        >
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              custom={i}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 25 } }}
              className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white border border-black/5 shadow-card hover:shadow-card-hover transition-shadow duration-500"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring", damping: 12, stiffness: 100 }}
                className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-light text-gold mb-4 sm:mb-5"
              >
                {value.icon}
              </motion.div>
              <h3 className="font-display text-base sm:text-lg text-brown mb-2 sm:mb-3">
                {value.title}
              </h3>
              <p className="text-brown/50 text-xs sm:text-sm font-body leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
