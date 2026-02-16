"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import CartDrawer from "@/components/cart/CartDrawer";

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PageLoader />
      <SmoothScroll>
        <Navigation />
        {children}
        <Footer />
      </SmoothScroll>
      <CartDrawer />
    </>
  );
}
