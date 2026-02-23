"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "Yazol".split("");

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9998] bg-bg flex flex-col items-center justify-center"
        >
          {/* Letter-by-letter reveal */}
          <div className="relative">
            <h1 className="font-display text-5xl md:text-7xl flex">
              {LETTERS.map((letter, i) => (
                <span key={i} className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block text-brown"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      delay: 0.1 + i * 0.08,
                      type: "spring",
                      damping: 18,
                      stiffness: 100,
                    }}
                  >
                    {letter}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Gold shimmer sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent pointer-events-none"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="font-body text-xs tracking-[0.4em] uppercase text-gold mt-3 text-center"
            >
              Coffee & Food
            </motion.p>
          </div>

          {/* Loading bar */}
          <div className="mt-12 w-48 h-px bg-black/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full bg-gradient-to-r from-gold/60 to-gold"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
