"use client";

import { useEffect, useRef, useCallback } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafId = useRef<number>(0);

  const raf = useCallback((time: number) => {
    lenisRef.current?.raf(time);
    rafId.current = requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll with Framer Motion / native scroll events
    lenis.on("scroll", () => {
      // Dispatch a native scroll event so Framer Motion's useScroll picks it up
      window.dispatchEvent(new Event("scroll"));
    });

    rafId.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId.current);
      lenis.destroy();
    };
  }, [raf]);

  return <>{children}</>;
}
