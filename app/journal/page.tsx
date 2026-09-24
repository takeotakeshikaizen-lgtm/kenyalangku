import type { Metadata } from "next";
import {
  PageIntro,
  JournalCards,
  CollaborationCTA,
} from "@/src/components/StudioUI";
export const metadata: Metadata = {
  title: "Studio journal",
  description:
    "Ideas, perspectives, and project introductions from the independent Malaysian game studio KenyalangKu.",
};
export default function Journal() {
  return (
    <main id="main">
      <PageIntro
        label="THE STUDIO JOURNAL"
        title="Every world starts"
        emphasis="with a little curiosity."
        description="Notes on what we’re making, what inspires us, and the ideas that connect our culture with play."
      />
      <section className="container journal-page">
        <div className="collection-header">
          <span>
            THE OPENING CHAPTER <b>03</b>
          </span>
          <span>Studio notes & perspectives</span>
        </div>
        <JournalCards />
      </section>
      <CollaborationCTA />
    </main>
  );
}
