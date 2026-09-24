"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState, type CSSProperties } from "react";

// The standalone homepage uses the same stylesheet, artwork, and timing.
// Keying by pathname also replays the introduction on Next.js client navigation.
export default function SiteLoader() {
  const pathname = usePathname();
  return <LoadingScreen key={pathname} />;
}

function LoadingScreen() {
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const started = performance.now();
    const tasks = new Map<string, number>();
    const locked = new Map<HTMLElement, boolean>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const imageListeners: (() => void)[] = [];
    let disposed = false;
    let leaving = false;
    let completionScheduled = false;

    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay);
      timers.add(timer);
    };
    const unlock = () => {
      root.classList.remove("is-loading", "is-revealing");
      locked.forEach((wasInert, element) => { element.inert = wasInert; });
      document.querySelector("#site-content")?.removeAttribute("aria-busy");
    };
    const finish = () => {
      if (disposed || leaving) return;
      leaving = true;
      root.classList.replace("is-loading", "is-revealing");
      setPhase("revealing");
      later(() => {
        if (disposed) return;
        unlock();
        setPhase("done");
      }, reduced.matches ? 0 : 720);
    };
    const mark = (name: string, weight: number) => {
      if (disposed || leaving) return;
      tasks.set(name, weight);
      const total = [...tasks.values()].reduce((sum, value) => sum + value, 0);
      setProgress(total);
      if (total === 100 && !completionScheduled) {
        completionScheduled = true;
        later(finish, Math.max(0, (reduced.matches ? 0 : 2300) - (performance.now() - started)));
      }
    };
    const imageReady = (image: HTMLImageElement) => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
      const ready = () => { remove(); resolve(); };
      const remove = () => {
        image.removeEventListener("load", ready);
        image.removeEventListener("error", ready);
      };
      image.addEventListener("load", ready, { once: true });
      image.addEventListener("error", ready, { once: true });
      imageListeners.push(remove);
    });

    root.classList.add("is-loading");
    document.querySelectorAll<HTMLElement>("#site-content").forEach(element => {
      locked.set(element, element.inert);
      element.inert = true;
    });
    document.querySelector("#site-content")?.setAttribute("aria-busy", "true");
    // Company pages are ready after React mounts; they do not wait for WebGL.
    Promise.resolve().then(() => mark("page", 50));
    Promise.all([...document.images].filter(image => image.loading !== "lazy").map(imageReady))
      .then(() => mark("images", 25));
    Promise.allSettled([
      document.fonts.load('400 26px "Kenyalang Jawi"', "کڽالڠکو"),
      document.fonts.load('400 12px "Kenyalang UI"'),
    ]).then(() => mark("fonts", 25));
    // Asset failure or a stalled request must never block the page indefinitely.
    later(finish, 8000);

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      imageListeners.forEach(remove => remove());
      unlock();
    };
  }, []);

  return (
    <>
      {phase !== "done" && (
        <div id="intro-loader" className="intro-loader" data-phase={phase} aria-label="Loading KenyalangKu">
          <div className="intro-center">
            <Image className="intro-logo" src="/night-walk/assets/loading-logo.webp" alt="KenyalangKu hornbill logo" width={58} height={58} priority unoptimized />
            <p className="intro-jawi" lang="ms-Arab" dir="rtl" aria-label="Kenyalangku">کڽالڠکو</p>
            <div className="intro-track" role="progressbar" aria-label="Preparing the KenyalangKu journey" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} style={{ "--intro-progress": progress / 100 } as CSSProperties}><span /></div>
            <div className="intro-meta">
              <p id="intro-message" role="status">{phase === "loading" ? "AWAKENING THE KENYALANG" : progress === 100 ? "THE JOURNEY BEGINS" : "ENTERING THE JOURNEY"}</p>
              <span id="intro-percent" aria-hidden="true">{progress}%</span>
            </div>
          </div>
        </div>
      )}
      <noscript><style>{".intro-loader { display: none !important; }"}</style></noscript>
    </>
  );
}
