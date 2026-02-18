"use client";

import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/lib/theme-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </CartProvider>
  );
}
