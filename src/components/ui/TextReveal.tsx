"use client";

import { motion } from "framer-motion";

interface TextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export default function TextReveal({
  children,
  className = "",
  as: Tag = "h2",
  delay = 0,
  stagger = 0.04,
  once = true,
}: TextRevealProps) {
  const words = children.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
        className="inline"
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", rotateX: 40 },
                visible: {
                  y: "0%",
                  rotateX: 0,
                  transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                  },
                },
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && "\u00A0"}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

// Line-by-line variant for paragraphs
export function LineReveal({
  children,
  className = "",
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once, margin: "-40px" }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 80,
          delay,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Fade up variant for simpler reveals
export function FadeUp({
  children,
  className = "",
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 80,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
