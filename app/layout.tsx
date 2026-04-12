import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ScrollToTopButton from "./ScrollToTopButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ва Банкъ",
  description: "Имперский интеллектуальный салон",
  icons: { icon: '/icon.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#E6DDC4]">
        {/* Muted, sepia, blurred, cluttered newspaper background */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 w-full h-full"
          style={{
            backgroundImage: "url('/images/cluttered-newspapers.png')",
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            filter: 'sepia(0.7) brightness(0.85) blur(1px)',
            opacity: 1,
          }}
        />
        {/* Paper grain overlay for all layers */}
        <div
          aria-hidden
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            opacity: 0.18,
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' fill=\'none\'><filter id=\'n\' x=\'0\' y=\'0\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>')",
            backgroundSize: '220px 220px',
            mixBlendMode: 'multiply',
          }}
        />
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
