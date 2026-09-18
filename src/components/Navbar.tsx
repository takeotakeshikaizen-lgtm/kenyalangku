"use client";

import { useState } from "react";
import {
  Menu,
  X,
  CircleUserRound,
  Layers3,
} from "lucide-react";

const links = [
  {
    label: "Why",
    href: "#why",
  },
  {
    label: "Vision",
    href: "#vision",
  },
  {
    label: "Projects",
    href: "#projects",
  },
  {
    label: "Journal",
    href: "#journal",
  },
  {
    label: "Culture",
    href: "#culture",
  },
  {
    label: "Collaborate",
    href: "#collaborate",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-panel">
        {/* LEFT */}
        <div className="navbar-left">
          <a
            href="#top"
            className="navbar-brand"
            aria-label="Kenyalangku Home"
          >
            <div className="navbar-logo">
              <span>K</span>
            </div>

            <span className="navbar-name">
              Kenyalangku
            </span>
          </a>

          <nav className="desktop-nav">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="navbar-actions">
          <a
            href="#projects"
            className="navbar-icon-button"
            aria-label="Projects"
          >
            <Layers3 size={17} strokeWidth={1.6} />
          </a>

          <a
            href="#collaborate"
            className="navbar-icon-button"
            aria-label="Contact"
          >
            <CircleUserRound
              size={17}
              strokeWidth={1.6}
            />
          </a>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? (
              <X size={21} strokeWidth={1.6} />
            ) : (
              <Menu size={21} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          <nav>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}