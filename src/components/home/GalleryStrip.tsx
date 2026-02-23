"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const ROW_1 = [
  "/Images/gallery-1.jpg",
  "/Images/gallery-2.jpg",
  "/Images/gallery-3.jpg",
  "/Images/gallery-4.jpg",
  "/Images/gallery-5.jpg",
  "/Images/gallery-6.jpg",
];

const ROW_2 = [
  "/Images/gallery-7.jpg",
  "/Images/gallery-8.jpg",
  "/Images/food-1.jpg",
  "/Images/food-2.jpg",
  "/Images/ambiance-1.jpg",
  "/Images/dessert-1.jpg",
];

export default function GalleryStrip() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-15%", "0%"]);

  return (
    <section ref={ref} className="py-6 sm:py-10 bg-bg overflow-hidden">
      <div className="mb-3 sm:mb-4">
        <motion.div style={{ x: x1 }} className="flex gap-3 sm:gap-4">
          {[...ROW_1, ...ROW_1].map((src, i) => (
            <div
              key={`r1-${i}`}
              className="relative w-[160px] sm:w-[220px] md:w-[280px] aspect-[4/3] flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`Yazol gallery ${(i % ROW_1.length) + 1}`}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          ))}
        </motion.div>
      </div>
      <motion.div style={{ x: x2 }} className="flex gap-3 sm:gap-4">
        {[...ROW_2, ...ROW_2].map((src, i) => (
          <div
            key={`r2-${i}`}
            className="relative w-[160px] sm:w-[220px] md:w-[280px] aspect-[4/3] flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden"
          >
            <Image
              src={src}
              alt={`Yazol gallery ${(i % ROW_2.length) + 7}`}
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
