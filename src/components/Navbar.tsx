"use client";

/* Full document links are required: Home is a standalone WebGL document. */
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Home", "/"],
  ["About us", "/about"],
  ["Projects", "/projects"],
  ["Journal", "/journal"],
  ["Collaboration", "/collaboration"],
  ["Contact", "/contact"],
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const isCurrent = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [...document.querySelectorAll<HTMLElement>("main, footer")];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab") {
        const controls = [toggle.current, ...Array.from(panel.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].filter(Boolean) as HTMLElement[];
        const current = controls.indexOf(document.activeElement as HTMLElement);
        event.preventDefault();
        controls[(current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, i) => { element.inert = previousInert[i]; });
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`kk-header${pathname === "/about" || pathname === "/contact" ? " site-header--heritage" : " kk-header--paper"}`}>
      <a className="kk-header__brand" href="/" aria-label="KenyalangKu home" onClick={() => setOpen(false)}>
        <Image className="kk-header__logo" src="/images/kenyalangku/kenyalangku-logo.png" alt="" width={48} height={48} priority unoptimized />
        <span className="kk-header__name">
          <span className="kk-header__jawi" lang="ms-Arab" dir="rtl">کڽالڠکو</span>
          <span className="kk-header__latin">Kenyalang<em>Ku</em></span>
        </span>
      </a>
      <nav className="kk-header__nav" aria-label="Main navigation">
        {links.map(([label, href]) => <a key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}>{label}</a>)}
      </nav>
      <button ref={toggle} className="kk-header__toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu" aria-label={open ? "Close navigation" : "Open navigation"}>
        <span /><span />
      </button>
      <nav ref={panel} id="menu" className="kk-navigation-panel" aria-label="Mobile navigation" hidden={!open}>
        <div className="kk-navigation-panel__links">
          {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} aria-current={isCurrent(href) ? "page" : undefined}>{label}</a>)}
        </div>
        <span className="kk-navigation-panel__note">MADE IN MALAYSIA. IMAGINED FOR EVERYONE.</span>
        <a className="kk-navigation-panel__email" href="mailto:kenyalangku@gmail.com">kenyalangku@gmail.com ↗</a>
      </nav>
    </header>
  );
}
