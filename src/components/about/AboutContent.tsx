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

const valueVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      type: "spring" as const,
      damping: 20,
      stiffness: 80,
    },
  }),
};

const GALLERY_IMAGES = [
  "/Images/gallery-1.jpg",
  "/Images/gallery-2.jpg",
  "/Images/gallery-3.jpg",
  "/Images/gallery-4.jpg",
  "/Images/gallery-5.jpg",
  "/Images/gallery-6.jpg",
  "/Images/gallery-7.jpg",
  "/Images/gallery-8.jpg",
];

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
      {/* Hero */}
      <section ref={heroRef} className="relative h-[70svh] sm:h-[80svh] min-h-[450px] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-6 md:px-12 lg:px-20 pb-12 sm:pb-16 md:pb-24 max-w-7xl mx-auto"
        >
          <LineReveal>
            <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/80 mb-3 sm:mb-4">
              Our Story
            </p>
          </LineReveal>
          <TextReveal
            as="h1"
            className="font-display text-[clamp(2rem,6vw,6rem)] leading-[0.9] tracking-[-0.02em] text-white max-w-3xl"
            delay={0.1}
          >
            Where tradition meets heart
          </TextReveal>
        </motion.div>
      </section>

      {/* Opening statement */}
      <section className="bg-white py-16 sm:py-20 md:py-32 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <FadeUp>
              <p className="font-display text-[clamp(1.3rem,3vw,2.5rem)] leading-[1.35] text-brown text-balance">
                We&apos;re a small family taking our first steps toward a
                dream&mdash;making a living doing what we love while creating
                food that feels like home.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="w-16 h-px bg-gold mt-8 sm:mt-10" />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Story body */}
      <section className="bg-white px-5 sm:px-6 md:px-12 lg:px-20 pb-20 sm:pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="font-body text-brown/70 text-base sm:text-lg md:text-xl leading-[1.85]">
                Our kitchen is where tradition meets creativity, bridging
                cultures where flavors spark memories and bring comfort. Every
                recipe carries a piece of who we are&mdash;from the slow ritual
                of Jebena Buna to the warmth of fresh Ambasha baked the way our
                family has for generations.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="font-body text-brown/70 text-base sm:text-lg md:text-xl leading-[1.85] mt-6 sm:mt-8">
                We didn&apos;t set out to build a restaurant empire. We set out
                to share something real. The dishes we grew up with, the flavors
                that bring us together, the feeling of sitting down to a meal
                prepared with care.
              </p>
            </FadeUp>
            <FadeUp delay={0.25}>
              <p className="font-body text-brown/70 text-base sm:text-lg md:text-xl leading-[1.85] mt-6 sm:mt-8">
                That&apos;s what Yazol is&mdash;a family&apos;s offering.
                Whether it&apos;s your first visit or your fiftieth, we want you
                to feel at home.
              </p>
            </FadeUp>
          </div>

          <div ref={mosaicRef} className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                style={{ y: mosaicY1 }}
                className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden"
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
                className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden mt-8 sm:mt-12"
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
              <blockquote className="relative pl-6 sm:pl-8 border-l-2 border-gold mt-10 sm:mt-14">
                <p className="font-display text-xl sm:text-2xl md:text-3xl text-brown italic leading-snug">
                  &ldquo;A customer told us our sponge cake reminded them of
                  their mother&apos;s baking back home.&rdquo;
                </p>
              </blockquote>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="font-body text-brown/70 text-base sm:text-lg leading-[1.85] mt-8 sm:mt-10">
                Whether it&apos;s Erteb that reminds us of busy mornings,
                Ambasha passed down through generations, or Jebena Buna brewed
                with care&mdash;every dish tells a story. And now, we get to
                share those stories with you.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-light py-20 sm:py-24 md:py-36 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16 md:mb-24">
            <LineReveal>
              <span className="text-gold text-xs sm:text-sm tracking-[0.2em] uppercase font-body">
                What we stand for
              </span>
            </LineReveal>
            <TextReveal
              as="h2"
              className="font-display text-[clamp(1.8rem,4vw,4rem)] text-brown mt-3"
              delay={0.1}
            >
              Built on care
            </TextReveal>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
          >
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
              <motion.div key={value.number} custom={i} variants={valueVariants}>
                <span className="font-display text-5xl sm:text-6xl md:text-7xl text-brown/[0.06] block mb-3 sm:mb-4 select-none">
                  {value.number}
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-brown mb-3 sm:mb-4">
                  {value.title}
                </h3>
                <p className="font-body text-brown/60 text-sm sm:text-base leading-relaxed">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery strip — auto-scrolling marquee */}
      <section className="bg-bg overflow-hidden py-3 sm:py-4">
        <div className="flex gap-3 sm:gap-4 animate-marquee">
          {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative w-[200px] sm:w-[260px] md:w-[340px] aspect-square flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`Yazol gallery ${(i % GALLERY_IMAGES.length) + 1}`}
                fill
                className="object-cover"
                sizes="340px"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats + CTA */}
      <section className="bg-white py-20 sm:py-24 md:py-32 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-16 sm:mb-20 md:mb-28">
              {[
                { number: 17, suffix: "+", label: "Menu items" },
                { number: 5, suffix: "", label: "Categories" },
                { number: 1, suffix: "", label: "Family" },
                { number: 2857, suffix: "", label: "Danforth Ave" },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <p className="font-display text-3xl sm:text-4xl md:text-6xl text-brown">
                    <CountUp target={stat.number} suffix={stat.suffix} />
                  </p>
                  <p className="font-body text-[10px] md:text-xs tracking-[0.2em] uppercase text-brown/50 mt-1 sm:mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="rounded-2xl bg-brown p-8 sm:p-12 md:p-20 text-center">
              <h2 className="font-display text-[clamp(1.3rem,3vw,3rem)] leading-[1.1] text-white mb-3 sm:mb-4">
                Come say hello
              </h2>
              <p className="font-body text-white/60 text-sm md:text-base max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed">
                We&apos;re on Danforth Ave in Scarborough. Stop by for a coffee,
                grab a bite, or just come see what we&apos;re about.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 bg-white text-brown font-body text-sm tracking-wider uppercase rounded-full hover:bg-bg transition-colors duration-300"
                >
                  Order for Pickup
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto text-center px-8 py-3.5 sm:py-4 border border-white/25 text-white/80 font-body text-sm tracking-wider uppercase rounded-full hover:border-white/50 transition-colors"
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
