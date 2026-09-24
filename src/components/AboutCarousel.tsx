"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import styles from "@/src/components/AboutCarousel.module.css";

const slides = [
  {
    id: "founder",
    label: "THE FOUNDER",
    title: "Syahmir Supardi",
    description:
      "Syahmir Supardi is pursuing a Bachelor of Computer Science (Hons.), with studies in game design, software development, and AI. His work as a research officer has shaped an analytical approach to turning complex data into clear systems and useful insights. As founder and game creator at KenyalangKu, he brings that curiosity to building Malaysian game worlds that carry local culture to players everywhere.",
    image: "/images/kenyalangku/syahmir-supardi.jpg",
    imageAlt: "Portrait of KenyalangKu founder and game creator Syahmir Supardi.",
    imageLabel: "SYAHMIR SUPARDI · FOUNDER & GAME CREATOR",
    contain: false,
  },
  {
    id: "vision",
    label: "OUR VISION",
    title: "A place on the world stage.",
    description:
      "A future where Malaysia is internationally recognised for distinctive, world-class games rooted in its own cultural identity.",
    image: "/images/kenyalangku/palace-bg.png",
    imageAlt: "Illustrated timber palace with layered roofs and carved details.",
    imageLabel: "HERITAGE · REIMAGINED",
    contain: true,
  },
  {
    id: "mission",
    label: "OUR MISSION",
    title: "Create here. Connect everywhere.",
    description:
      "Create culturally rooted Malaysian games for global audiences, develop local creative talent, and connect our culture with the international games industry.",
    image: "/night-walk/assets/garden.webp",
    imageAlt: "Lantern-lit wooden pavilion beside water beneath a vermilion moon.",
    imageLabel: "LOCAL IDENTITY · GLOBAL IMAGINATION",
    contain: false,
  },
  {
    id: "objective",
    label: "CULTURE THROUGH PLAY",
    title: "Make culture playable.",
    description:
      "Transform heritage, mythology, landscapes, and imagination into interactive experiences that encourage curiosity about Malaysia.",
    image: "/night-walk/assets/myth-tanah.webp",
    imageAlt:
      "Early MYTH: TANAH character concept showing a Malay-inspired wanderer with a keris.",
    imageLabel: "MYTH: TANAH · EARLY VISUAL CONCEPT",
    contain: false,
  },
];

const cycleDuration = 7200;

export default function AboutCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || hovering || focusWithin || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % slides.length);
    }, cycleDuration);
    return () => window.clearTimeout(timer);
  }, [active, focusWithin, hovering, paused, reducedMotion]);

  const slide = slides[active];
  const slideNumber = String(active + 1).padStart(2, "0");
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setFocusWithin(false);
    }
  };

  return (
    <section
      className={styles.carousel}
      aria-label="About KenyalangKu stories"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={handleBlur}
    >
      <div
        className={`${styles.visual} ${slide.contain ? styles.contain : ""} ${slide.id === "founder" ? styles.founderVisual : ""}`}
      >
        <Image
          key={slide.image}
          className={styles.visualImage}
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority={active === 0}
          sizes="(max-width: 760px) 100vw, 54vw"
        />
        <div className={styles.visualShade} aria-hidden="true" />
        <span className={styles.visualIndex}>KK / {slideNumber}</span>
        <span className={styles.visualCaption}>{slide.imageLabel}</span>
      </div>

      <div className={styles.story}>
        <div className={styles.storyContent} key={slide.id}>
          <div className={styles.storyMeta}>
            <span><i aria-hidden="true" />{slide.label}</span>
            <span>{slideNumber} / {String(slides.length).padStart(2, "0")}</span>
          </div>
          <h2
            className={slide.id === "founder" ? styles.founderTitle : undefined}
          >
            {slide.title}
          </h2>
          <div className={styles.storyRule} aria-hidden="true" />
          <p>{slide.description}</p>
          <Link className={styles.storyLink} href="/collaboration">
            Continue the conversation <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.controls} role="group" aria-label="Carousel controls">
          <button
            className={styles.arrow}
            type="button"
            aria-label="Previous story"
            onClick={() => setActive((active + slides.length - 1) % slides.length)}
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          <div className={styles.pagination} role="group" aria-label="Choose a story">
            {slides.map((item, index) => (
              <button
                key={item.id}
                className={`${styles.paginationButton} ${active === index ? styles.selected : ""}`}
                type="button"
                aria-label={`Show ${item.label.toLowerCase()} story`}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            className={styles.arrow}
            type="button"
            aria-label="Next story"
            onClick={() => setActive((active + 1) % slides.length)}
          >
            <ArrowRight size={17} aria-hidden="true" />
          </button>
          <span className={styles.controlSpacer} aria-hidden="true" />
          <button
            className={styles.pause}
            type="button"
            disabled={reducedMotion}
            aria-label={
              reducedMotion
                ? "Automatic playback is disabled by reduced motion settings"
                : paused
                  ? "Resume automatic carousel"
                  : "Pause automatic carousel"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused || reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
          <span className={styles.pauseLabel}>
            {reducedMotion ? "AUTO OFF" : paused ? "PLAY" : "PAUSE"}
          </span>
        </div>
      </div>
    </section>
  );
}
