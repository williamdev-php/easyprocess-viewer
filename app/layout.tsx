import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://qvickosite.com"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
