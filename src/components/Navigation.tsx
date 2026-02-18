"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Badge from "@/components/ui/Badge";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const { itemCount, openCart } = useCart();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
    setIsHidden(latest > lastY.current && latest > 100);
    lastY.current = latest;
  });

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Our Story", href: "/about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 theme-transition ${
          isScrolled
            ? "bg-bg/80 backdrop-blur-xl border-b border-cream/5 shadow-gold-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl text-cream hover:text-gold transition-colors duration-300 theme-transition"
            >
              Yazol
            </Link>

            {/* Desktop — Centered pill nav */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 bg-surface/60 backdrop-blur-xl rounded-full px-2 py-1.5 border border-cream/10 theme-transition">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`relative font-body text-xs tracking-wider uppercase px-5 py-2 rounded-full transition-colors duration-300 theme-transition ${
                        isActive
                          ? "text-bg"
                          : "text-cream/70 hover:text-cream"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-gold rounded-full theme-transition"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-6">
              {/* Cart icon */}
              <motion.button
                onClick={openCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative text-cream/70 hover:text-cream transition-colors theme-transition"
                aria-label="Open cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <Badge count={itemCount} />
              </motion.button>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/menu"
                  className="inline-block px-6 py-2.5 bg-gold text-bg font-body text-sm tracking-wider uppercase rounded-full hover:bg-gold-light hover:shadow-gold-md transition-all duration-300 theme-transition"
                >
                  Order Now
                </Link>
              </motion.div>
            </div>

            {/* Mobile right side */}
            <div className="flex items-center gap-4 md:hidden">
              <motion.button
                onClick={openCart}
                whileTap={{ scale: 0.9 }}
                className="relative text-cream/70 hover:text-cream transition-colors theme-transition"
                aria-label="Open cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <Badge count={itemCount} />
              </motion.button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="z-50 relative w-8 h-8 flex flex-col justify-center gap-1.5"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full h-px bg-cream block"
                />
                <motion.span
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                  className="w-full h-px bg-cream block"
                />
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full h-px bg-cream block"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-bg/98 backdrop-blur-xl md:hidden flex flex-col justify-center px-12 theme-transition"
          >
            <nav className="space-y-2">
              {navLinks.map((link, i) => (
                <div key={link.name} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{
                      delay: i * 0.1,
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-display text-display-md text-cream hover:text-gold transition-colors py-2 theme-transition"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: navLinks.length * 0.1, type: "spring", damping: 20 }}
                className="pt-8"
              >
                <Link
                  href="/menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-block px-8 py-4 bg-gold text-bg font-display text-xl rounded-full shadow-gold-md theme-transition"
                >
                  Order Now
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
