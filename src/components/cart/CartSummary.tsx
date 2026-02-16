"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartSummary() {
  const { subtotal, tax, total, closeCart } = useCart();

  return (
    <div className="border-t border-cream/10 pt-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-cream-muted">Subtotal</span>
        <span className="text-cream">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-cream-muted">HST (13%)</span>
        <span className="text-cream">${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-display pt-2 border-t border-cream/10">
        <span className="text-cream">Total</span>
        <span className="text-gold">${total.toFixed(2)}</span>
      </div>
      <Link
        href="/checkout"
        onClick={closeCart}
        className="block w-full py-3.5 bg-gold text-bg text-center font-display rounded-xl hover:bg-gold-light transition-colors mt-4"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
