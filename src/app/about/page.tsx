import type { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "Our Story — Yazol Coffee",
  description:
    "A small family taking our first steps toward a dream. East African flavors, passed down through generations, now on Danforth Ave in Toronto.",
};

export default function AboutPage() {
  return <AboutContent />;
}
