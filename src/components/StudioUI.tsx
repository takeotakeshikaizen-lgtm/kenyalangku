import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Sprout,
  Sparkles,
} from "lucide-react";
import { projects } from "@/src/lib/content";

export function SectionLabel({
  children,
  number,
}: {
  children: React.ReactNode;
  number?: string;
}) {
  return (
    <div className="section-label">
      {number && <span className="section-index">{number}</span>}
      <span className="label-line" />
      {children}
    </div>
  );
}

export function PageIntro({
  label,
  title,
  emphasis,
  description,
}: {
  label: string;
  title: string;
  emphasis: string;
  description: string;
}) {
  return (
    <section className="page-intro container">
      <SectionLabel>{label}</SectionLabel>
      <h1>
        {title}
        <br />
        <em>{emphasis}</em>
      </h1>
      <p>{description}</p>
      <span className="intro-ornament" aria-hidden="true">
        ✳︎
      </span>
    </section>
  );
}

export function Pillars() {
  const pillars = [
    {
      title: "A place on the world stage.",
      label: "OUR VISION",
      icon: Globe2,
      text: "A future where Malaysia is internationally recognised for distinctive, world-class games rooted in its own cultural identity.",
    },
    {
      title: "Create here. Connect everywhere.",
      label: "OUR MISSION",
      icon: Sprout,
      text: "Create culturally rooted Malaysian games for global audiences, develop local creative talent, and connect our culture with the international games industry.",
    },
    {
      title: "Culture through play.",
      label: "OUR OBJECTIVE",
      icon: Sparkles,
      text: "Transform heritage, mythology, landscapes, and imagination into interactive experiences that encourage curiosity about Malaysia.",
    },
  ];
  return (
    <div className="pillars">
      {pillars.map((pillar, i) => (
        <article className="pillar" key={pillar.label}>
          <div className="pillar-top">
            <pillar.icon size={25} strokeWidth={1.2} />
            <span>0{i + 1}</span>
          </div>
          <span className="small-label">{pillar.label}</span>
          <h3>{pillar.title}</h3>
          <p>{pillar.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ProjectCards() {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <Link
          href={`/projects/${project.slug}`}
          className={`project-card project-${project.slug}`}
          key={project.slug}
        >
          <div className="project-image">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className="project-image-shade" />
            <span className="project-badge">
              <i />
              {project.status}
            </span>
            <span className="project-image-title">{project.title}</span>
            <span className="art-label">{project.imageLabel}</span>
            <span className="project-open">
              <ArrowUpRight size={23} />
            </span>
          </div>
          <div className="project-card-copy">
            <div>
              <span className="small-label">{project.category}</span>
              <h3>{project.subtitle}</h3>
            </div>
            <span className="project-number">/{project.number}</span>
          </div>
          <p>{project.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function Founder({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className={`founder-section ${expanded ? "founder-expanded" : ""}`}>
      <div className="founder-art">
        <div className="founder-art-pattern" />
        <span className="small-label">THE BEGINNING OF SOMETHING OUR OWN</span>
        <Image
          className="founder-logo"
          src="/images/kenyalangku/kenyalangku-logo.png"
          alt="KenyalangKu’s hornbill symbol"
          width={270}
          height={270}
        />
        <div className="founder-art-bottom">
          <span>
            One creator.
            <br />A shared possibility.
          </span>
          <span className="founder-seal">
            MALAYSIA
            <br />
            <b>✳︎</b>
            <br />
            TO THE WORLD
          </span>
        </div>
      </div>
      <div className="founder-copy">
        <SectionLabel number="03">THE PERSON BEHIND THE VISION</SectionLabel>
        <h2>
          {expanded ? (
            <>
              Syahmir
              <span className="founder-role">FOUNDER & GAME CREATOR</span>
            </>
          ) : (
            <>
              Small beginnings.
              <br />
              <em>Boundless imagination.</em>
            </>
          )}
        </h2>
        <p className="lead">
          Hi, I’m Syahmir.
          <br />
          The founder and game creator behind KenyalangKu.
        </p>
        <p>
          I’m building an independent game studio with a simple ambition: to
          bring Malaysian culture and imagination to players around the world.
        </p>
        <p>
          My current projects, PUSAKA and MYTH: TANAH, are the beginning of that
          journey — exploring our identity through combat, worldbuilding, and
          interactive storytelling.
        </p>
        {expanded ? (
          <div className="founder-focus">
            <div className="focus-tags">
              <span>Game creation</span>
              <span>Worldbuilding</span>
              <span>Malaysian culture</span>
            </div>
            <details open>
              <summary>
                <span>01</span> The work <span>+</span>
              </summary>
              <p>
                Currently creating PUSAKA and MYTH: TANAH — two original
                projects exploring different ways to bring Malaysian identity
                into play.
              </p>
            </details>
            <details>
              <summary>
                <span>02</span> The purpose <span>+</span>
              </summary>
              <p>
                To make distinctive Malaysian games that connect with global
                audiences, while creating opportunities for local creative
                talent.
              </p>
            </details>
            <details>
              <summary>
                <span>03</span> The invitation <span>+</span>
              </summary>
              <p>
                Ideas grow through conversation. Creators, cultural voices,
                publishers, and potential investors are welcome to connect.
              </p>
              <Link href="/contact" className="text-link">
                Say hello to Syahmir <ArrowUpRight size={15} />
              </Link>
            </details>
          </div>
        ) : (
          <Link className="text-link" href="/about">
            A little more about us <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
    </div>
  );
}

export function CollaborationCTA() {
  return (
    <section className="collaboration-cta">
      <div className="container cta-inner">
        <div>
          <SectionLabel>GOOD THINGS BEGIN WITH A CONVERSATION</SectionLabel>
          <h2>
            Let’s build something
            <br />
            <em>that belongs to the world.</em>
          </h2>
          <p>
            Creators, communities, and partners. There’s room for you in our
            next chapter.
          </p>
        </div>
        <Link
          className="circle-link"
          href="/contact"
          aria-label="Start a conversation"
        >
          <ArrowUpRight size={42} strokeWidth={1.2} />
        </Link>
      </div>
    </section>
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="back-link">
      <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} />
      {children}
    </Link>
  );
}
