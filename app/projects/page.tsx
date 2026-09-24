import type { Metadata } from "next";
import {
  PageIntro,
  ProjectCards,
  CollaborationCTA,
} from "@/src/components/StudioUI";
export const metadata: Metadata = {
  title: "Our projects",
  description:
    "Discover PUSAKA, an online multiplayer Silat fighting game, and MYTH: TANAH, a Malaysian-inspired fantasy action-adventure.",
};
export default function Projects() {
  return (
    <main id="main">
      <PageIntro
        label="OUR ORIGINAL WORLDS"
        title="Different worlds."
        emphasis="The same Malaysian soul."
        description="Meet the projects taking shape at KenyalangKu. Each begins with something close to home, and an ambition to reach beyond it."
      />
      <section className="container projects-page">
        <div className="collection-header">
          <span>
            ALL PROJECTS <b>02</b>
          </span>
          <span>
            <i className="status-dot" />
            Currently in development
          </span>
        </div>
        <ProjectCards />
        <p className="collection-note">
          A first look at worlds in progress. Concept imagery will be replaced
          with project captures as development continues.
        </p>
      </section>
      <CollaborationCTA />
    </main>
  );
}
