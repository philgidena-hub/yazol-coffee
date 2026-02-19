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

export default function AboutContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);

  const mosaicRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mosaicProgress } = useScroll({
    target: mosaicRef,
    offset: ["start end", "end start"],
  });
  const mosaicY1 = useTransform(mosaicProgress, [0, 1], [60, -60]);
  const mosaicY2 = useTransform(mosaicProgress, [0, 1], [30, -30]);

  return (
    <main>
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-[80svh] min-h-[500px] overflow-hidden">
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 scale-[1.15]">
          <Image
            src="/Images/coffee-station.jpg"
            alt="Yazol Coffee preparation"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/20 to-bg" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 md:pb-24 max-w-7xl mx-auto"
        >
          <LineReveal>
            <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-gold mb-4">
              Our Story
            </p>
          </LineReveal>
          <TextReveal
            as="h1"
            className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.02em] text-cream max-w-3xl"
            delay={0.1}
          >
            Where tradition meets heart
          </TextReveal>
        </motion.div>
      </section>

      {/* ── Opening statement ── */}
      <section className="bg-cream py-20 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <FadeUp>
              <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.3] text-bg/85 text-balance">
                We&apos;re a small family taking our first steps toward a
                dream&mdash;making a living doing what we love while creating
                food that feels like home.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="w-16 h-px bg-gold mt-10" />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Story body ── */}
      <section className="bg-cream px-6 md:px-12 lg:px-20 pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* Left — narrative */}
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="font-body text-bg/65 text-lg md:text-xl leading-[1.9]">
                Our kitchen is where tradition meets creativity, bridging
                cultures where flavors spark memories and bring comfort. Every
                recipe carries a piece of who we are&mdash;from the slow ritual
                of Jebena Buna to the warmth of fresh Ambasha baked the way our
                family has for generations.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="font-body text-bg/65 text-lg md:text-xl leading-[1.9] mt-8">
                We didn&apos;t set out to build a restaurant empire. We set out
                to share something real. The dishes we grew up with, the flavors
                that bring us together, the feeling of sitting down to a meal
                prepared with care.
              </p>
            </FadeUp>
            <FadeUp delay={0.25}>
              <p className="font-body text-bg/65 text-lg md:text-xl leading-[1.9] mt-8">
                That&apos;s what Yazol is&mdash;a family&apos;s offering.
                Whether it&apos;s your first visit or your fiftieth, we want you
                to feel at home.
              </p>
            </FadeUp>
          </div>

          {/* Right — image mosaic + quote */}
          <div ref={mosaicRef} className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                style={{ y: mosaicY1 }}
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
                style={{ y: mosaicY2 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-12"
              >
                <Image
                  src="/Images/culture-decor.jpg"
                  alt="Cultural decor at Yazol"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </motion.div>
            </div>

            <FadeUp delay={0.1}>
              <blockquote className="relative pl-8 border-l-2 border-gold mt-14">
                <p className="font-display text-2xl md:text-3xl text-bg/80 italic leading-snug">
                  &ldquo;A customer told us our sponge cake reminded them of
                  their mother&apos;s baking back home.&rdquo;
                </p>
              </blockquote>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="font-body text-bg/60 text-lg leading-[1.9] mt-10">
                Whether it&apos;s Erteb that reminds us of busy mornings,
                Ambasha passed down through generations, or Jebena Buna brewed
                with care&mdash;every dish tells a story. And now, we get to
                share those stories with you.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Values / Pillars ── */}
      <section className="bg-bg py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24">
            <LineReveal>
              <span className="text-gold text-sm tracking-[0.2em] uppercase font-body">
                What we stand for
              </span>
            </LineReveal>
            <TextReveal
              as="h2"
              className="font-display text-[clamp(2rem,4vw,4rem)] text-cream mt-3"
              delay={0.1}
            >
              Built on care
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                number: "01",
                title: "Tradition",
                text: "Every recipe carries generations of knowledge. We honour our East African roots in every dish, every brew, every bite.",
              },
              {
                number: "02",
                title: "Community",
                text: "Good food brings people together. Our door is open to everyone — neighbours, travellers, curious souls looking for something authentic.",
              },
              {
                number: "03",
                title: "Quality",
                text: "No shortcuts, no compromises. Fresh ingredients, prepared by hand, served with pride. If we wouldn't eat it ourselves, we won't serve it to you.",
              },
            ].map((value, i) => (
              <FadeUp key={value.number} delay={i * 0.1}>
                <div className="group">
                  <span className="font-display text-6xl md:text-7xl text-cream/[0.06] block mb-4 select-none">
                    {value.number}
                  </span>
                  <h3 className="font-display text-2xl text-cream mb-4">
                    {value.title}
                  </h3>
                  <p className="font-body text-cream/50 leading-relaxed">
                    {value.text}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery strip ── */}
      <section className="bg-bg overflow-hidden py-4">
        <div className="flex gap-4 animate-none">
          {[
            "/Images/gallery-1.jpg",
            "/Images/gallery-2.jpg",
            "/Images/gallery-3.jpg",
            "/Images/gallery-4.jpg",
            "/Images/gallery-5.jpg",
            "/Images/gallery-6.jpg",
          ].map((src, i) => (
            <FadeUp key={src} delay={i * 0.05}>
              <div className="relative w-[260px] md:w-[340px] aspect-square flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={src}
                  alt={`Yazol gallery ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="340px"
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Stats + CTA ── */}
      <section className="bg-cream py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20 md:mb-28">
              {[
                { number: 17, suffix: "+", label: "Menu items" },
                { number: 5, suffix: "", label: "Categories" },
                { number: 1, suffix: "", label: "Family" },
                { number: 2857, suffix: "", label: "Danforth Ave" },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <p className="font-display text-4xl md:text-6xl text-bg">
                    <CountUp target={stat.number} suffix={stat.suffix} />
                  </p>
                  <p className="font-body text-[10px] md:text-xs tracking-[0.2em] uppercase text-bg/40 mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* CTA */}
          <FadeUp delay={0.2}>
            <div className="rounded-2xl bg-bg p-12 md:p-20 text-center">
              <h2 className="font-display text-[clamp(1.5rem,3vw,3rem)] leading-[1] text-cream mb-4">
                Come say hello
              </h2>
              <p className="font-body text-cream/40 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
                We&apos;re on Danforth Ave in Scarborough. Stop by for a coffee,
                grab a bite, or just come see what we&apos;re about.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/menu"
                  className="group relative px-8 py-4 bg-cream text-bg font-body text-sm tracking-wider uppercase rounded-full overflow-hidden transition-all duration-500"
                >
                  <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10">Order for Pickup</span>
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 border border-cream/20 text-cream font-body text-sm tracking-wider uppercase rounded-full hover:border-cream/50 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
