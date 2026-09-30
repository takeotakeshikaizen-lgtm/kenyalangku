"use client";

import { usePathname } from "next/navigation";

export default function PageBackdrop() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <div className="inner-page-backdrop" aria-hidden="true" />;
}
