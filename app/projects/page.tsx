import type { Metadata } from "next";
import ProjectCarousel from "@/src/components/ProjectCarousel";
import { projects } from "@/src/lib/content";
export const metadata: Metadata = {
  title: "Our projects",
  description:
    "Discover PUSAKA, an online multiplayer Silat fighting game, and MYTH: TANAH, a Malaysian-inspired fantasy action-adventure.",
};
export default function Projects() {
  return (
    <main id="main">
      <ProjectCarousel items={projects.map(({ slug, title, subtitle, category, image, imageAlt, number, status }) => ({ slug, title, subtitle, category, image, imageAlt, number, status }))} />
    </main>
  );
}
