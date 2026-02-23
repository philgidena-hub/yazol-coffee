"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BadgeProps {
  count: number;
}

export default function Badge({ count }: BadgeProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brown text-white text-[11px] font-bold rounded-full flex items-center justify-center"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
