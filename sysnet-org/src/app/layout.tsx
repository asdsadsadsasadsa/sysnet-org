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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              ABRAKADABRA
            </Link>
            <div className="flex gap-4 text-sm text-slate-600">
              <Link href="/people">People</Link>
              <Link href="/feed">Feed</Link>
              <Link href="/about">About</Link>
              <Link href="/guidelines">Guidelines</Link>
              <Link href="/onboarding" className="rounded-md bg-slate-900 px-3 py-1.5 text-white">
                Join
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
