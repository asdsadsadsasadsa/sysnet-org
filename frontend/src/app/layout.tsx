import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Link from "next/link";
import NavAuthActions from "@/components/NavAuthActions";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SYLEN — SYstems Leadership & Engineering Network",
  description:
    "A professional network for systems engineers. Find peers by domain, tooling, and MBSE practice.",
  openGraph: {
    title: "SYLEN — SYstems Leadership & Engineering Network",
    description:
      "SYLEN connects systems engineers to find serious peers, share practical knowledge, and build professional trust.",
    siteName: "SYLEN",
    type: "website",
  },
};

const nav = [
  { href: "/feed", label: "Feed" },
  { href: "/people", label: "Directory" },
  { href: "/g", label: "Groups" },
  { href: "/submissions", label: "Papers" },
  { href: "/library", label: "Library" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-white text-on-surface blueprint-grid">
        <div className="min-h-screen">
          {/* Fixed editorial nav */}
          <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/90 backdrop-blur-lg border-b border-outline-variant/30">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tighter text-brand-navy font-headline"
              >
                SYLEN
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-on-surface-variant font-medium hover:text-brand-navy transition-colors font-headline tracking-tight text-sm uppercase"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <NavAuthActions />
            </div>
          </header>

          <main className="pt-16 mx-auto max-w-6xl px-4 pb-8 md:px-5 md:pb-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
