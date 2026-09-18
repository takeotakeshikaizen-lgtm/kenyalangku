export default function ProjectsSection() {
  return (
    <section
      className="projects-zone"
      id="projects"
    >
      <div className="container">
        {/* =====================================================
            INTRODUCTION
        ===================================================== */}

        <div className="projects-intro">
          <div>
            <span className="section-number">
              03 — Our Flagship Project
            </span>

            <h2 className="projects-title">
              One world to
              <br />
              prove the vision.
            </h2>
          </div>

          <p>
            MYTH: TANAH is the first original IP built under
            Kenyalangku — translating Malaysian-inspired identity
            into a premium game experience.
          </p>
        </div>

        {/* =====================================================
            MYTH: TANAH
        ===================================================== */}

        <article className="featured-project">
          <div className="featured-project-info">
            <div className="featured-project-top">
              <span className="project-status">
                Flagship Project
              </span>

              <span className="project-year">
                In Development
              </span>
            </div>

            <div className="featured-project-title">
              <h3>
                MYTH:
                <br />
                TANAH
              </h3>

              <p>
                A premium single-player action-adventure built around
                exploration, environmental storytelling and colossal
                Penjaga encounters.
              </p>
            </div>

            {/* PROJECT PROOF */}

            <div className="project-proof-grid">
              <div>
                <span>
                  Experience
                </span>

                <p>
                  Exploration, traversal and colossal encounters.
                </p>
              </div>

              <div>
                <span>
                  Identity
                </span>

                <p>
                  Malaysian and Nusantara-inspired worldbuilding.
                </p>
              </div>

              <div>
                <span>
                  Current Focus
                </span>

                <p>
                  Prove one complete Penjaga experience first.
                </p>
              </div>
            </div>

            {/* TAGS */}

            <div className="project-tags">
              <span>
                Action-Adventure
              </span>

              <span>
                Single-Player
              </span>

              <span>
                PC First
              </span>

              <span>
                Vertical Slice
              </span>
            </div>

            {/* CTA */}

            <div className="featured-project-action">
              <a
                href="#"
                className="button button-dark"
              >
                Explore MYTH: TANAH
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* =================================================
              PROJECT VISUAL
          ================================================= */}

          <div className="featured-project-visual">
            <div className="project-visual-top">
              <span>
                Original IP
              </span>

              <span>
                Malaysia
              </span>
            </div>

            <div className="featured-project-overlay">
              <span>
                MYTH: TANAH
              </span>

              <div>
                <p>
                  Malaysian myth.
                </p>

                <p>
                  Monumental scale.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}