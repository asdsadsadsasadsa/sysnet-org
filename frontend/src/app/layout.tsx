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
  { href: "/people", label: "Directory" },
  { href: "/g", label: "Groups" },
  { href: "/submissions", label: "Papers" },
  { href: "/events", label: "Events" },
  { href: "/library", label: "Library" },
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "Profile" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 px-3 pt-3 md:px-5">
            <nav className="shell-card-strong mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-blue-700 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                    S
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">SYstems Leadership & Engineering Network</div>
                    <div className="text-sm font-semibold tracking-[0.16em] text-slate-900">SYLEN</div>
                  </div>
                </Link>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/onboarding" className="primary-button ml-2 px-4 py-2.5">
                  Join the network
                </Link>
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8 md:px-5 md:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
