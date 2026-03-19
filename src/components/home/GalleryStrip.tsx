"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const DEFAULT_ROW_1 = [
  "/Images/gallery-1.jpg",
  "/Images/gallery-2.jpg",
  "/Images/gallery-3.jpg",
  "/Images/gallery-4.jpg",
  "/Images/gallery-5.jpg",
  "/Images/gallery-6.jpg",
];

const DEFAULT_ROW_2 = [
  "/Images/gallery-7.jpg",
  "/Images/gallery-8.jpg",
  "/Images/food-1.jpg",
  "/Images/food-2.jpg",
  "/Images/ambiance-1.jpg",
  "/Images/dessert-1.jpg",
];

export default function GalleryStrip() {
  const [row1, setRow1] = useState(DEFAULT_ROW_1);
  const [row2, setRow2] = useState(DEFAULT_ROW_2);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.galleryImages && data.galleryImages.length > 0) {
          const images = data.galleryImages as string[];
          const half = Math.ceil(images.length / 2);
          setRow1(images.slice(0, half));
          setRow2(images.slice(half));
        }
      })
      .catch(() => {});
  }, []);
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
          {[...row1, ...row1].map((src, i) => (
            <div
              key={`r1-${i}`}
              className="relative w-[160px] sm:w-[220px] md:w-[280px] aspect-[4/3] flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`Yazol gallery ${(i % row1.length) + 1}`}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          ))}
        </motion.div>
      </div>
      <motion.div style={{ x: x2 }} className="flex gap-3 sm:gap-4">
        {[...row2, ...row2].map((src, i) => (
          <div
            key={`r2-${i}`}
            className="relative w-[160px] sm:w-[220px] md:w-[280px] aspect-[4/3] flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden"
          >
            <Image
              src={src}
              alt={`Yazol gallery ${(i % row2.length) + row1.length + 1}`}
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
