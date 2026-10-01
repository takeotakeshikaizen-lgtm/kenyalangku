/* The standalone journey and App Router pages share this public stylesheet. */
/* eslint-disable @next/next/no-css-tags */
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Navbar from "@/src/components/Navbar";
import SiteFooter from "@/src/components/SiteFooter";
import SiteLoader from "@/src/components/SiteLoader";
import PageBackdrop from "@/src/components/PageBackdrop";
import "./globals.css";
import "../public/night-walk/footer-9.css";
import "../public/night-walk/intro.css";
import "./inner-pages.css";

const manrope = localFont({
  src: "../public/night-walk/fonts/manrope-latin.woff2",
  weight: "200 800",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KenyalangKu — Rooted in heritage. Made for the world.",
    template: "%s | KenyalangKu",
  },
  description:
    "An independent Malaysian game studio creating culturally rooted games for a global audience. Discover PUSAKA, MYTH: TANAH, and the story behind KenyalangKu.",
  applicationName: "KenyalangKu",
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: "KenyalangKu",
    title: "KenyalangKu — Culture through play",
    description:
      "Malaysian stories. New worlds. Discover an independent game studio rooted in heritage and imagination.",
  },
  icons: { icon: "/brand-icon.png", apple: "/brand-icon.png" },
};

export const viewport: Viewport = { themeColor: "#080c10" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="stylesheet" href="/night-walk/site-header.css" />
      </head>
      <body className={manrope.variable}>
        <PageBackdrop />
        <SiteLoader />
        <div id="site-content">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navbar />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
