"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import TextReveal, { LineReveal } from "@/components/ui/TextReveal";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], ["0%", "15%"]);

  // Mouse parallax for image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgMoveX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { damping: 30, stiffness: 100 });
  const imgMoveY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 30, stiffness: 100 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative h-[100svh] min-h-[700px] overflow-hidden bg-bg"
    >
      {/* Background image with scroll parallax + mouse parallax */}
      <motion.div
        style={{ scale: imgScale, y: imgY, x: imgMoveX }}
        className="absolute inset-[-20px]"
      >
        <motion.div style={{ y: imgMoveY }} className="w-full h-full">
          <Image
            src="/Images/hero-spread.jpg"
            alt="Yazol Coffee food spread"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      {/* Gradient orb for depth */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[120px] pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-3xl"
      >
        <LineReveal delay={0.3}>
          <span className="inline-block text-gold text-sm tracking-[0.3em] uppercase font-body mb-6">
            East African Flavors &mdash; Toronto
          </span>
        </LineReveal>

        <div className="mb-6">
          <TextReveal
            as="h1"
            className="font-display text-display-lg text-cream leading-[0.95]"
            delay={0.5}
            stagger={0.08}
          >
            A taste of home.
          </TextReveal>
        </div>

        <LineReveal delay={0.9}>
          <p className="text-cream-muted text-lg md:text-xl font-body max-w-lg leading-relaxed mb-10">
            Authentic coffee and food crafted with love. From Jebena Buna to Ambasha — order now for pickup.
          </p>
        </LineReveal>

        <LineReveal delay={1.1}>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Link
                href="/menu"
                className="inline-block px-8 py-3.5 bg-gold text-bg font-display text-sm rounded-full hover:bg-gold-light transition-colors"
              >
                Order Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Link
                href="#menu"
                className="inline-block px-8 py-3.5 border border-cream/30 text-cream font-display text-sm rounded-full hover:border-cream/60 transition-colors"
              >
                View Menu
              </Link>
            </motion.div>
          </div>
        </LineReveal>
      </motion.div>

      {/* Floating accent badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[12%] glass px-4 py-2 rounded-full"
        >
          <span className="text-gold text-xs font-body tracking-wider">17+ Dishes</span>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[55%] right-[8%] glass px-4 py-2 rounded-full"
        >
          <span className="text-cream text-xs font-body tracking-wider">Danforth Ave</span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-cream-muted text-[10px] tracking-[0.3em] uppercase font-body">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
