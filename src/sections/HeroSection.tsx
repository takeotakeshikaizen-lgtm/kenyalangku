import Navbar from "@/src/components/Navbar";
import HeroBackgroundVideo from "@/src/components/HeroBackgroundVideo";

export default function HeroSection() {
  return (
    <section className="hero-zone">
      <HeroBackgroundVideo />

      <div
        className="hero-video-overlay"
        aria-hidden="true"
      />

      <Navbar />

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="eyebrow">
              Malaysian Game Development
            </span>

            <h1 className="display">
              Rooted in Heritage.
              <br />
              Played Worldwide.
            </h1>

            <p className="hero-description">
              Kenyalangku creates original game experiences rooted in
              Malaysian identity and built for audiences around the world.
            </p>

            <div className="hero-actions">
              <a
                href="#why"
                className="button button-dark"
              >
                Discover Kenyalangku
                <span>↘</span>
              </a>

              <a
                href="#projects"
                className="button button-outline"
              >
                Explore Our Game
              </a>
            </div>

            <p className="principle-line">
              Entertainment first. Culture within it. Curiosity after it.
            </p>
          </div>

          <div
            className="hero-visual-space"
            aria-hidden="true"
          />
        </div>
      </section>
    </section>
  );
}