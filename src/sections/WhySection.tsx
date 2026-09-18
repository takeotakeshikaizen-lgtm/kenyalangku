import WhyExperience from "@/src/experience/WhyExperience";

export default function WhySection() {
  return (
    <section
      className="why-zone"
      id="why"
    >
      {/* =====================================================
          THREE.JS PALACE

          Palace now exists inside WebGL instead of
          being a normal HTML image.
      ===================================================== */}

      <WhyExperience />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="container why-content">
        {/* =====================================================
            INTRO
        ===================================================== */}

        <div className="why-intro">
          {/* LEFT */}

          <div className="why-intro-left">
            <span className="section-number">
              02 — Why Kenyalangku
            </span>

            <h2 className="why-title">
              Distinctly
              <br />
              Malaysian.
              <br />

              <span>
                Built for the world.
              </span>
            </h2>
          </div>

          {/* RIGHT */}

          <div className="why-intro-right">
            <p className="why-lead">
              Kenyalangku creates original game IP
              rooted in Malaysian culture, mythology
              and imagination — built for global
              audiences.
            </p>

            <p className="why-copy">
              We see Malaysia not only as inspiration,
              but as a creative advantage:
              underrepresented stories, places and
              cultural identity that can shape worlds
              with strong distinction and global appeal.
            </p>

            <p className="why-approach">
              Game first. Culture gives it identity.
              Build the IP to grow.
            </p>
          </div>
        </div>

        {/* =====================================================
            THREE PILLARS
        ===================================================== */}

        <div className="pillars-strip">
          {/* =================================================
              DISTINCTIVE IP
          ================================================= */}

          <article className="pillar-item">
            <div className="pillar-icon-badge">
              <img
                src="/images/icons/malaysia.png"
                alt=""
                className="pillar-icon"
              />
            </div>

            <div className="pillar-content">
              <h3>
                Distinctive IP
              </h3>

              <p>
                Original game worlds shaped by
                Malaysian culture, mythology and
                visual identity.
              </p>
            </div>
          </article>

          {/* =================================================
              FOCUSED EXECUTION
          ================================================= */}

          <article className="pillar-item">
            <div className="pillar-icon-badge">
              <img
                src="/images/icons/malaysian.png"
                alt=""
                className="pillar-icon"
              />
            </div>

            <div className="pillar-content">
              <h3>
                Focused Execution
              </h3>

              <p>
                A milestone-driven approach that
                proves the core experience before
                scaling production.
              </p>
            </div>
          </article>

          {/* =================================================
              GLOBAL BY DESIGN
          ================================================= */}

          <article className="pillar-item">
            <div className="pillar-icon-badge">
              <img
                src="/images/icons/moon-kite.png"
                alt=""
                className="pillar-icon"
              />
            </div>

            <div className="pillar-content">
              <h3>
                Global by Design
              </h3>

              <p>
                Local cultural identity paired with
                globally understandable gameplay and
                market positioning.
              </p>
            </div>
          </article>
        </div>

        {/* =====================================================
            GUIDING PRINCIPLE
        ===================================================== */}

        <div className="why-principle">
          <span className="section-number">
            Guiding Principle
          </span>

          <div className="why-principle-text">
            <p>
              Rooted in culture.
            </p>

            <p>
              Driven by imagination.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}