import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "ABRAKADABRA — Systems Engineers Network",
  description:
    "Professional network for systems engineers: connect by domain, tooling, and MBSE practices.",
  openGraph: {
    title: "ABRAKADABRA — Systems Engineers Network",
    description:
      "Find peers, share systems engineering patterns, and build trusted professional connections.",
    type: "website",
  },
};

const nav = [
  { href: "/people", label: "People" },
  { href: "/feed", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/guidelines", label: "Guidelines" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-slate-900">
              ABRAKADABRA
            </Link>
            <div className="hidden items-center gap-5 text-sm text-slate-600 md:flex">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
              <Link
                href="/onboarding"
                className="rounded-lg bg-gradient-to-r from-slate-900 to-blue-700 px-3 py-2 font-medium text-white shadow-sm"
              >
                Join
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
