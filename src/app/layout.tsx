import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import StorefrontShell from "@/components/StorefrontShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yazol Coffee — Order Online",
  description: "East African-inspired coffee and food. Order online for pickup at our Danforth Ave location in Toronto.",
  keywords: "Yazol Coffee, East African coffee, Jebena Buna, Ethiopian coffee, order online, Toronto coffee, Danforth",
  authors: [{ name: "Yazol Coffee" }],
  openGraph: {
    title: "Yazol Coffee — Order Online",
    description: "Authentic East African coffee and food. Order for pickup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          <StorefrontShell>
            {children}
          </StorefrontShell>
        </Providers>
      </body>
    </html>
  );
}
