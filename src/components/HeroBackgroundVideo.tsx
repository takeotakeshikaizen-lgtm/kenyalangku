"use client";

import { useEffect, useRef } from "react";

export default function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVideoEnded = () => {
    const video = videoRef.current;

    if (!video) return;

    /*
      Keep the video paused on the final visible frame.
      Moving back a tiny amount helps prevent some browsers
      from displaying a blank frame at the exact end.
    */
    video.pause();

    if (video.duration) {
      video.currentTime = Math.max(
        0,
        video.duration - 0.04
      );
    }

    timerRef.current = setTimeout(() => {
      const currentVideo = videoRef.current;

      if (!currentVideo) return;

      currentVideo.currentTime = 0;

      currentVideo.play().catch(() => {
        // Autoplay may be blocked in unusual browser conditions.
      });
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-bg-video"
      autoPlay
      muted
      playsInline
      preload="auto"
      poster="/images/kenyalangku/aras-bg.png"
      onEnded={handleVideoEnded}
      aria-hidden="true"
    >
      <source
        src="/images/kenyalangku/aras-video-bg.mp4"
        type="video/mp4"
      />
    </video>
  );
}