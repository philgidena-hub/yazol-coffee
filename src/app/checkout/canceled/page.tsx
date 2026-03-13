"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

function CanceledContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-bg pt-32 pb-20">
      <div className="max-w-xl mx-auto px-5 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gold"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-brown mb-3">
            Payment Canceled
          </h1>
          <p className="text-brown/50 font-body text-sm mb-8 max-w-sm mx-auto">
            Your payment was not completed. Your order has been saved — you can
            try paying again or choose to pay at pickup.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="inline-block px-8 py-3.5 bg-gold text-white font-display text-sm rounded-full hover:bg-gold/90 transition-colors"
              >
                View Your Order
              </Link>
            )}
            <Link
              href="/menu"
              className="inline-block px-8 py-3.5 border border-brown text-brown font-display text-sm rounded-full hover:bg-brown hover:text-white transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function CheckoutCanceledPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg pt-32 pb-20">
          <div className="max-w-xl mx-auto px-5 sm:px-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 bg-brown/10 rounded-full mx-auto" />
              <div className="h-8 bg-brown/10 rounded-lg w-48 mx-auto" />
              <div className="h-4 bg-brown/10 rounded-lg w-64 mx-auto" />
            </div>
          </div>
        </main>
      }
    >
      <CanceledContent />
    </Suspense>
  );
}
