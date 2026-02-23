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

  // Only use transparent/white text on the homepage hero
  const isHomepage = pathname === "/";
  const isTransparent = isHomepage && !isScrolled;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
    setIsHidden(latest > lastY.current && latest > 100);
    lastY.current = latest;
  });

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Menu", href: "/menu" },
    { name: "Our Story", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: isHidden ? -100 : 0, opacity: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-soft-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className={`font-display text-2xl transition-colors duration-300 ${
                isTransparent
                  ? "text-white hover:text-white/80"
                  : "text-brown hover:text-gold"
              }`}
            >
              Yazol
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-body text-sm tracking-wider uppercase transition-colors duration-300 ${
                    isTransparent
                      ? "text-white/70 hover:text-white"
                      : "text-brown/50 hover:text-brown"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Cart icon */}
              <motion.button
                onClick={openCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`relative transition-colors ${
                  isTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-brown/50 hover:text-brown"
                }`}
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
                  className={`inline-block px-6 py-2.5 font-body text-sm tracking-wider uppercase rounded-full transition-all duration-300 ${
                    isTransparent
                      ? "bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/25"
                      : "bg-brown text-white hover:bg-brown-light"
                  }`}
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
                className={`relative transition-colors ${
                  isTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-brown/50 hover:text-brown"
                }`}
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
                  className={`w-full h-px block ${
                    isTransparent && !isMobileMenuOpen ? "bg-white" : "bg-brown"
                  }`}
                />
                <motion.span
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                  className={`w-full h-px block ${
                    isTransparent && !isMobileMenuOpen ? "bg-white" : "bg-brown"
                  }`}
                />
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`w-full h-px block ${
                    isTransparent && !isMobileMenuOpen ? "bg-white" : "bg-brown"
                  }`}
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
            className="fixed inset-0 z-40 bg-bg/98 backdrop-blur-xl md:hidden flex flex-col justify-center px-12"
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
                      className="block font-display text-display-md text-brown hover:text-gold transition-colors py-2"
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
                  className="inline-block px-8 py-4 bg-brown text-white font-display text-xl rounded-full shadow-soft-lg"
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
