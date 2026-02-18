"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only show custom cursor on desktop
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnterInteractive = () => setIsHovering(true);
    const handleMouseLeaveInteractive = () => setIsHovering(false);

    window.addEventListener("mousemove", handleMouseMove);

    // Observe interactive elements
    const interactiveSelectors = "a, button, [role='button'], input, textarea, select";
    const addListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnterInteractive);
        el.addEventListener("mouseleave", handleMouseLeaveInteractive);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnterInteractive);
        el.removeEventListener("mouseleave", handleMouseLeaveInteractive);
      });
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{
          x,
          y,
          borderColor: isHovering
            ? "rgb(var(--theme-accent) / 0.6)"
            : "rgb(var(--theme-accent) / 0.3)",
        }}
        animate={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
        }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none z-[9999] mix-blend-difference theme-transition"
      />
      {/* Inner dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          backgroundColor: isHovering
            ? "rgb(var(--theme-accent))"
            : "rgb(var(--theme-cream))",
        }}
        animate={{
          width: isHovering ? 6 : 4,
          height: isHovering ? 6 : 4,
        }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[9999] theme-transition"
      />
    </>
  );
}
