import type { Metadata } from "next";
import { Playfair_Display, Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "P.O Visuals — The Visual Essence",
  description:
    "Premium photography and videography services. Capturing moments with precision, artistry, and vision.",
  keywords: ["photography", "videography", "portfolio", "P.O Visuals", "Ghana"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${spaceMono.variable} ${inter.variable}`}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
