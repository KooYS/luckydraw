import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

const moneygraphyPixel = localFont({
  src: "../../public/fonts/Moneygraphy-Pixel.ttf",
  variable: "--font-moneygraphy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LuckyDraw",
  description: "LuckyDraw",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`min-h-screen ${moneygraphyPixel.variable} font-moneygraphy`}>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
