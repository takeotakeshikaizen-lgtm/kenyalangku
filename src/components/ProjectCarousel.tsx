"use client";

// Adapted from the supplied React Bits Carousel: spring track, drag, perspective,
// and loop clones. Artwork, navigation, and accessibility are studio-specific.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import styles from "./ProjectCarousel.module.css";

type CarouselProject = {
  slug: string; title: string; subtitle: string; category: string;
  image: string; imageAlt: string; number: string; status: string;
};
const GAP = 24;
const SPRING = { type: "spring" as const, stiffness: 190, damping: 30 };
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotionPreference(notify: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const getMotionPreference = () => window.matchMedia(MOTION_QUERY).matches;
// A stable server snapshot avoids different markup during hydration.
const getServerMotionPreference = () => true;

function ProjectSlide({ project, index, offset, x, active, reduced, opening, onOpen, dragged }: {
  project: CarouselProject; index: number; offset: number; x: MotionValue<number>;
  active: boolean; reduced: boolean; opening: boolean; onOpen: (slug: string) => void;
  dragged: React.RefObject<boolean>;
}) {
  const distance = Math.max(1, offset);
  const rotateY = useTransform(x, [-(index + 1) * distance, -index * distance, -(index - 1) * distance], [13, 0, -13]);
  const scale = useTransform(x, [-(index + 1) * distance, -index * distance, -(index - 1) * distance], [.91, 1, .91]);
  return (
    <motion.article className={styles.slide} style={reduced ? undefined : { rotateY, scale }}
      role="group" aria-roledescription="slide" aria-label={`${project.number} — ${project.title}`} aria-hidden={!active} inert={!active}>
      <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 600px) 780px, (max-width: 1300px) 78vw, 1040px" fetchPriority={index === 1 ? "high" : "auto"} loading="eager" draggable={false} />
      <div className={styles.shade} />
      <div className={styles.cardTop}><span>KENYALANGKU ORIGINAL</span><span className={styles.status}><i />{project.status}</span></div>
      <div className={styles.cardBottom}>
        <span className={styles.category}>{project.category}</span>
        <h2>{project.title}</h2>
        <div className={styles.cardCaption}><p>{project.subtitle}</p><span className={styles.enter}>Explore project <ArrowUpRight size={19} /></span></div>
      </div>
      <Link href={`/projects/${project.slug}`} className={styles.cardLink} tabIndex={active ? 0 : -1} draggable={false}
        aria-label={`Explore ${project.title}`} aria-disabled={opening || undefined}
        onClick={(event) => { if ((dragged.current && event.detail !== 0) || opening) event.preventDefault(); }}
        onNavigate={(event) => { event.preventDefault(); if (!opening) onOpen(project.slug); }} />
    </motion.article>
  );
}

export default function ProjectCarousel({ items }: { items: CarouselProject[] }) {
  const router = useRouter();
  const reduced = useSyncExternalStore(subscribeMotionPreference, getMotionPreference, getServerMotionPreference);
  const measure = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [offset, setOffset] = useState(0);
  const [position, setPosition] = useState(1);
  const [jumping, setJumping] = useState(false);
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [opening, setOpening] = useState(false);
  const x = useMotionValue(0);
  const slides = [items[items.length - 1], ...items, items[0]];
  const active = (position - 1 + items.length) % items.length;
  const autoplay = !paused && !hovered && !focused && !hidden && !reduced && !opening;

  useEffect(() => {
    const element = measure.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setOffset(entry.contentRect.width + GAP));
    observer.observe(element);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  useEffect(() => {
    if (!autoplay || moving || !offset) return;
    const timer = setTimeout(() => { setMoving(true); setPosition(p => p + 1); }, 7000);
    return () => clearTimeout(timer);
  }, [autoplay, moving, offset, position]);
  useEffect(() => () => { if (openingTimer.current) clearTimeout(openingTimer.current); }, []);
  useEffect(() => {
    if (!jumping) return;
    const frame = requestAnimationFrame(() => setJumping(false));
    return () => cancelAnimationFrame(frame);
  }, [jumping]);

  const go = useCallback((target: number) => {
    setPaused(true);
    if (moving || opening || !offset || target === position) return;
    setMoving(true);
    setPosition(Math.max(0, Math.min(target, items.length + 1)));
  }, [items.length, moving, opening, offset, position]);

  const open = (slug: string) => {
    setPaused(true);
    router.prefetch(`/projects/${slug}`);
    if (reduced) { router.push(`/projects/${slug}`); return; }
    setOpening(true);
    openingTimer.current = setTimeout(() => router.push(`/projects/${slug}`), 420);
  };

  return (
    <motion.section className={styles.carousel} aria-label="Our game projects" aria-roledescription="carousel"
      animate={opening ? { opacity: 0, scale: 1.025 } : { opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .4 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(position + (event.key === "ArrowRight" ? 1 : -1)); }
      }}>
      <header className={styles.heading}>
        <div><p className={styles.eyebrow}><i />OUR ORIGINAL WORLDS / 02 PROJECTS</p><h1>Choose your <em>world.</em></h1></div>
        <p className={styles.intro}>Made here. Imagined for everyone.<br />Discover the stories taking shape at KenyalangKu.</p>
      </header>
      <div className={styles.viewport}>
        <div className={styles.measure} ref={measure} aria-hidden="true" />
        <motion.div className={styles.track} style={{ x }} animate={{ x: -position * offset }}
          transition={jumping || reduced ? { duration: 0 } : SPRING}
          drag={moving || opening ? false : "x"} dragElastic={.12} dragMomentum={false}
          dragConstraints={{ left: -(items.length + 1) * offset, right: 0 }}
          onPointerDownCapture={() => { dragged.current = false; }}
          onDragStart={() => { dragged.current = true; setPaused(true); }}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 45 || Math.abs(info.velocity.x) > 500) go(position + (info.offset.x < 0 || info.velocity.x < -500 ? 1 : -1));
            else x.set(-position * offset);
          }}
          onAnimationComplete={() => {
            if (position === 0 || position === items.length + 1) {
              const next = position === 0 ? items.length : 1;
              setJumping(true); x.set(-next * offset); setPosition(next);
            }
            setMoving(false);
          }}>
          {slides.map((project, index) => <ProjectSlide key={`${project.slug}-${index}`} project={project} index={index} offset={offset} x={x} active={index === position} reduced={Boolean(reduced)} opening={opening} onOpen={open} dragged={dragged} />)}
        </motion.div>
      </div>
      <div className={styles.controls}>
        <div className={styles.selection} aria-live={autoplay ? "off" : "polite"} aria-atomic="true"><b>{items[active].number}</b><span>/ 02</span><span className={styles.selectionName}>{items[active].title}</span></div>
        <div className={styles.dots} aria-label="Choose a project">
          {items.map((item, index) => <button key={item.slug} onClick={() => go(index + 1)} aria-label={`Show ${item.title}`} aria-current={index === active ? "true" : undefined}><span /></button>)}
        </div>
        <div className={styles.arrows}>
          <button className={styles.pause} onClick={() => setPaused(p => !p)} aria-label={paused || reduced ? "Play carousel" : "Pause carousel"} disabled={Boolean(reduced)}>{paused || reduced ? <Play size={15} /> : <Pause size={15} />}</button>
          <button onClick={() => go(position - 1)} aria-label="Previous project" disabled={moving || opening}><ArrowLeft size={20} /></button>
          <button onClick={() => go(position + 1)} aria-label="Next project" disabled={moving || opening}><ArrowRight size={20} /></button>
        </div>
      </div>
      <div className={styles.notes}><span>DRAG TO DISCOVER · SELECT TO EXPLORE</span><span>Concept artwork · Games in development</span></div>
    </motion.section>
  );
}
