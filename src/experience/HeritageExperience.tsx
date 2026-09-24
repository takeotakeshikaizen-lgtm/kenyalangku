"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
const Scene = dynamic(() => import("./HeritageScene"), { ssr: false });
const subscribe = (callback: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export default function HeritageExperience() {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => true);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [paused, setPaused] = useState(false),
    [rotation, setRotation] = useState(0),
    [reset, setReset] = useState(0);
  const onReady = useCallback(() => setReady(true), []),
    onError = useCallback(() => setFailed(true), []);
  return (
    <div
      className={`heritage-experience ${ready && !failed ? "scene-ready" : ""}`}
    >
      <div className="scene-sun" aria-hidden="true" />
      <div className="scene-halo" aria-hidden="true" />
      <div className="scene-fallback">
        <Image
          src="/images/heritage-pavilion.svg"
          alt="A stylised traditional Malay timber pavilion, surrounded by palms"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 65vw"
        />
      </div>
      {!failed && (
        <Scene
          controls={{ paused: paused || reduced, rotation, reset }}
          onReady={onReady}
          onError={onError}
        />
      )}
      <div className="scene-caption">
        <span className="scene-live-dot" />
        <span>
          {failed
            ? "A LITTLE WORLD, ROOTED IN HERITAGE"
            : "A LITTLE WORLD YOU CAN EXPLORE"}
        </span>
      </div>
      {ready && !failed && (
        <div className="scene-controls">
          <span>Drag to explore</span>
          <button
            aria-label="Rotate scene left"
            onClick={() => setRotation(rotation - 0.3)}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            aria-label="Rotate scene right"
            onClick={() => setRotation(rotation + 0.3)}
          >
            <ChevronRight size={15} />
          </button>
          {!reduced && (
            <button
              aria-label={
                paused ? "Play scene animation" : "Pause scene animation"
              }
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
            </button>
          )}
          <button
            aria-label="Reset scene view"
            onClick={() => {
              setRotation(0);
              setReset(reset + 1);
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
