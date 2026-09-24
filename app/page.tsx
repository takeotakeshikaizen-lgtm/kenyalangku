import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import StudioHero from "@/src/sections/StudioHero";
import PartnerSlider from "@/src/components/PartnerSlider";
import {
  SectionLabel,
  Pillars,
  ProjectCards,
  Founder,
  JournalCards,
  CollaborationCTA,
} from "@/src/components/StudioUI";
export default function Home() {
  return (
    <main id="main">
      <StudioHero />
      <PartnerSlider />
      <section className="section container vision-section" id="vision">
        <div className="section-heading">
          <div>
            <SectionLabel number="01">OUR REASON TO CREATE</SectionLabel>
            <h2>
              Our roots run deep.
              <br />
              <em>Our imagination goes further.</em>
            </h2>
          </div>
          <p>
            Malaysia is full of stories the world has yet to play. We’re here to
            bring them to life — with care, curiosity, and an independent
            spirit.
          </p>
        </div>
        <Pillars />
      </section>
      <div className="songket-divider" aria-hidden="true" />
      <section className="section container" id="projects">
        <div className="section-heading">
          <div>
            <SectionLabel number="02">WORLDS IN THE MAKING</SectionLabel>
            <h2>
              Born here.
              <br />
              <em>Ready to go beyond.</em>
            </h2>
          </div>
          <Link className="text-link" href="/projects">
            Explore all projects <ArrowUpRight size={17} />
          </Link>
        </div>
        <ProjectCards />
      </section>
      <section className="about-home section">
        <div className="container">
          <Founder />
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <SectionLabel number="04">FROM THE STUDIO</SectionLabel>
            <h2>
              Ideas, stories,
              <br />
              <em>and the in-between.</em>
            </h2>
          </div>
          <Link className="text-link" href="/journal">
            Open the journal <ArrowUpRight size={17} />
          </Link>
        </div>
        <JournalCards />
      </section>
      <CollaborationCTA />
    </main>
  );
}
