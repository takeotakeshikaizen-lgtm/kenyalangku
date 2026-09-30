import type { Metadata } from "next";
import CircularCarousel from "@/src/components/CircularCarousel.jsx";
import styles from "./collaboration.module.css";

export const metadata: Metadata = {
  title: "Collaboration",
  description:
    "Meet the community and technology connected to KenyalangKu’s game development.",
};

const connections = [
  {
    src: "/images/partners/krackeddevs.svg",
    alt: "KrackedDevs logo",
    title: "KrackedDevs",
    subtitle: "AI COMMUNITY",
  },
  {
    src: "/images/partners/unreal-engine-mark.svg",
    alt: "Unreal Engine technology mark",
    title: "Unreal Engine",
    subtitle: "TECHNOLOGY WE BUILD WITH",
  },
];

export default function Collaboration() {
  return (
    <main id="main" className={styles.page}>
      <div className={styles.carouselFrame}>
        <CircularCarousel
          items={connections}
          preset="orbit"
          intro="rise"
          cardWidth={280}
          aspectRatio={2.25}
          gap={28}
          speed={7}
          pauseOnHover
          captions
          cornerRadius={10}
          fadeColor="#080c10"
          ariaLabel="KenyalangKu community and technology carousel"
        />
      </div>
    </main>
  );
}
