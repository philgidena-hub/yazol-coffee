"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import Image from "next/image";

const FILMSTRIP_IMAGES = [
  { src: "/Images/hero-spread.jpg", alt: "Food spread" },
  { src: "/Images/Jebena_buna.jpg", alt: "Jebena Buna" },
  { src: "/Images/gallery-4.jpg", alt: "Ice cream flavors" },
  { src: "/Images/ambasha.jpg", alt: "Ambasha bread" },
  { src: "/Images/barista.jpg", alt: "Barista at work" },
  { src: "/Images/samosas.jpg", alt: "Samosas" },
  { src: "/Images/sponge-cake.jpg", alt: "Sponge cake" },
  { src: "/Images/croissant.jpg", alt: "Croissant" },
];

function PhotoFilmstrip({ reverse = false }: { reverse?: boolean }) {
  const images = [...FILMSTRIP_IMAGES, ...FILMSTRIP_IMAGES];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex shrink-0 gap-3 md:gap-4 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="relative w-48 md:w-64 h-32 md:h-44 rounded-xl overflow-hidden flex-shrink-0"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="256px"
            />
            <div className="absolute inset-0 bg-bg/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PromoBanner() {
  const { itemCount, openCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-bg">
      {/* Photo filmstrip — visual break */}
      <div className="py-6 md:py-8 space-y-3 md:space-y-4">
        <PhotoFilmstrip />
        <PhotoFilmstrip reverse />
      </div>

      {/* CTA content */}
      <div className="relative py-20 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,165,116,0.04)_0%,transparent_70%)]" />

        <motion.div style={{ y }} className="relative z-10">
          <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", damping: 20 }}
              className="text-gold text-xs md:text-sm tracking-[0.3em] uppercase font-body mb-6"
            >
              Order for Pickup
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 80 }}
              className="font-display text-display-md md:text-display-lg text-cream leading-[0.95] mb-6"
            >
              Skip the line.
              <br />
              <span className="italic text-gold">Savor every sip.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", damping: 20 }}
              className="text-cream/50 font-body text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10"
            >
              Place your order online and pick up fresh at our
              Danforth Ave location. Ready in ~15 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", damping: 20 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {itemCount > 0 ? (
                <motion.button
                  onClick={openCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 bg-gold text-bg font-display text-sm rounded-full shadow-gold-lg hover:bg-gold-light transition-all duration-300"
                >
                  View Cart ({itemCount})
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/menu"
                    className="inline-block px-10 py-4 bg-gold text-bg font-display text-sm rounded-full shadow-gold-lg hover:bg-gold-light transition-all duration-300"
                  >
                    Start Your Order
                  </Link>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="tel:+14166905423"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-cream/15 text-cream/70 font-body text-sm rounded-full hover:border-gold/30 hover:text-cream transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call Us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
