"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Checkout", href: "/checkout" },
];

const trustBadges = [
  "Ethically Sourced",
  "Fair Trade",
  "Fresh Roasted",
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8 }}
      className="bg-brown"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 sm:gap-12 md:gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20, stiffness: 80 }}
            className="sm:col-span-2 md:col-span-5"
          >
            <Link
              href="/"
              className="font-display text-2xl sm:text-3xl text-white hover:text-brown-warm transition-colors duration-300"
            >
              Yazol
            </Link>
            <p className="font-body text-white/50 text-sm mt-3 sm:mt-4 max-w-xs leading-relaxed">
              A taste of home, on the move. East African-inspired coffee
              and food, crafted with care in Scarborough, Toronto.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-6">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/15 text-white/60 text-[10px] sm:text-xs font-body tracking-wide"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-6">
              <Link
                href="https://instagram.com/yazolcoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-brown-warm hover:text-brown-warm transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </Link>
              <Link
                href="https://tiktok.com/@yazolcoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-brown-warm hover:text-brown-warm transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49l.01-7.1a8.28 8.28 0 004.86 1.56v-3.45a4.85 4.85 0 01-1.15.49z" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 80 }}
            className="md:col-span-3 md:col-start-7"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-white/30 mb-4 sm:mb-5">Navigate</p>
            <nav className="space-y-2.5 sm:space-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block font-body text-sm text-white/50 hover:text-brown-warm transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 80 }}
            className="md:col-span-3"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-white/30 mb-4 sm:mb-5">Contact</p>
            <div className="space-y-2.5 sm:space-y-3 font-body text-sm">
              <p className="text-white/50">2857 Danforth Ave</p>
              <p className="text-white/50">Toronto, ON M4C 1M2</p>
              <Link href="tel:+14166905423" className="block text-white/50 hover:text-brown-warm transition-colors duration-300">
                (416) 690-5423
              </Link>
              <Link href="mailto:yazolcoffee@gmail.com" className="block text-white/50 hover:text-brown-warm transition-colors duration-300">
                yazolcoffee@gmail.com
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20 py-5 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="font-body text-[10px] sm:text-xs text-white/30">
            &copy; {year} Yazol Coffee. All rights reserved.
          </p>
          <p className="font-body text-[10px] sm:text-xs text-white/20">
            Powered by{" "}
            <a href="https://wezete.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-brown-warm transition-colors duration-300">
              Wezete
            </a>
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
