"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Box } from "lucide-react";

const partners = [
  {
    name: "KrackedDevs",
    label: "AI COMMUNITY",
    href: "https://krackeddevs.com/",
    text: "Connected through a community of builders, makers, and creative minds.",
  },
  {
    name: "UNREAL ENGINE",
    label: "TECHNOLOGY WE BUILD WITH",
    href: "https://www.unrealengine.com/",
    text: "A real-time creation tool supporting the worlds we imagine.",
  },
];

export default function PartnerSlider() {
  const [active, setActive] = useState(0);
  return (
    <section className="partner-band" aria-label="Community and technology">
      <div className="container partner-band-inner">
        <div className="partner-intro">
          <span className="small-label">CONNECTED BY CREATIVITY</span>
          <p>
            Building worlds.
            <br />
            Making connections.
          </p>
        </div>
        <div className="partner-window">
          <div
            className="partner-track"
            style={{ transform: `translateX(-${active * 25}%)` }}
          >
            {[...partners, ...partners].map((partner, i) => (
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`partner-logo ${i % 2 === active ? "partner-active" : ""}`}
                key={i}
                tabIndex={i > 1 ? -1 : 0}
                aria-hidden={i > 1 ? true : undefined}
                onFocus={() => {
                  if (i < 2) setActive(i);
                }}
              >
                {i % 2 === 0 ? (
                  <Image
                    className="partner-kd-symbol"
                    src="/images/partners/krackeddevs.svg"
                    alt=""
                    width={60}
                    height={30}
                  />
                ) : (
                  <Box
                    className="partner-tech-symbol"
                    size={29}
                    strokeWidth={1.1}
                  />
                )}
                <span>
                  <b className={i % 2 === 1 ? "unreal-wordmark" : undefined}>
                    {partner.name}
                  </b>
                  <small>{partner.label}</small>
                </span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        </div>
        <div className="slider-controls">
          <button
            aria-label="Previous collaborator or tool"
            onClick={() => setActive((active + 1) % partners.length)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label="Next collaborator or tool"
            onClick={() => setActive((active + 1) % partners.length)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="container partner-caption" aria-live="polite">
        <span>0{active + 1} / 02</span>
        <p>{partners[active].text}</p>
        <span className="partner-progress">
          <i style={{ transform: `translateX(${active * 100}%)` }} />
        </span>
      </div>
    </section>
  );
}
