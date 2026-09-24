import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AboutCarousel from "@/src/components/AboutCarousel";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Meet Syahmir Supardi, founder and game creator of KenyalangKu, and discover the studio’s vision, mission, and culture-through-play objective.",
};

export default function About() {
  return (
    <main id="main" className={styles.aboutPage}>
      <div className={styles.inner}>
        <section className={styles.intro} aria-labelledby="about-title">
          <div className={styles.eyebrow}>
            <i aria-hidden="true" /> KENYALANGKU / ABOUT US
          </div>
          <div className={styles.introRow}>
            <h1 id="about-title">
              Rooted here.<br />
              <span>Imagined everywhere.</span>
            </h1>
            <p>
              An independent Malaysian game studio founded by Syahmir Supardi, creating
              culturally rooted worlds for players everywhere.
            </p>
          </div>
        </section>

        <section className={styles.carouselWrap} aria-label="Our story and purpose">
          <AboutCarousel />
        </section>

        <div className={styles.closing}>
          <span>ROOTED IN CULTURE · DRIVEN BY IMAGINATION</span>
          <Link href="/collaboration">
            Work with KenyalangKu <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
