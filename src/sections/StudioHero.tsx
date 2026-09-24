import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import HeritageExperience from "@/src/experience/HeritageExperience";
export default function StudioHero() {
  return (
    <section className="studio-hero" aria-labelledby="hero-title">
      <div className="hero-texture" aria-hidden="true" />
      <HeritageExperience />
      <div className="hero-content container">
        <div className="hero-eyebrow">
          <span />
          INDEPENDENT SPIRIT. MALAYSIAN SOUL.
        </div>
        <h1 id="hero-title">
          Rooted in
          <br />
          <em>heritage.</em>
          <br />
          Made for
          <br />
          the world<span className="gold-period">.</span>
        </h1>
        <p>
          We turn the stories of home into worlds
          <br className="desktop-break" /> worth discovering. Malaysian games.
          <br className="desktop-break" /> Boundless imagination.
        </p>
        <div className="hero-actions">
          <Link href="/projects" className="button button-gold">
            Explore our worlds <ArrowUpRight size={18} />
          </Link>
          <Link href="/about" className="hero-story">
            Our story <MoveUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="hero-bottom container">
        <a href="#vision">
          <ArrowDown size={15} />
          <span>SCROLL TO DISCOVER</span>
        </a>
        <span className="hero-bottom-center">CULTURE. CRAFT. PLAY.</span>
        <span>
          MALAYSIA <span className="tiny-diamond">◆</span> WORLDWIDE
        </span>
      </div>
      <div className="hero-side-label" aria-hidden="true">
        WARISAN KITA. DUNIA BERSAMA.
      </div>
    </section>
  );
}
