import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

import "../src/styles/variables.css";
import "../src/styles/base.css";
import "../src/styles/navbar.css";
import "../src/styles/hero.css";
import "../src/styles/sections/why.css";
import "../src/styles/sections/projects.css";
import "../src/styles/footer.css";
import "../src/styles/responsive.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kenyalangku",
    template: "%s | Kenyalangku",
  },

  description:
    "Bringing Malaysian culture and imagination to the world through games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
      </body>
    </html>
  );
}