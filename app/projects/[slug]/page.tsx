import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/src/lib/content";
import {
  BackLink,
  SectionLabel,
  CollaborationCTA,
} from "@/src/components/StudioUI";
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project?.title ?? "Project not found",
    description: project?.description,
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <main id="main">
      <div className="container detail-top">
        <BackLink href="/projects">All projects</BackLink>
        <SectionLabel>{project.category}</SectionLabel>
        <h1 className="project-detail-title">{project.title}</h1>
        <div className="detail-title-bottom">
          <p>{project.subtitle}</p>
          <span>
            <i className="status-dot" />
            {project.status}
          </span>
        </div>
      </div>
      <figure className={`detail-visual container detail-${project.slug}`}>
        <div>
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            priority
            sizes="100vw"
          />
        </div>
        <figcaption>{project.imageLabel}</figcaption>
      </figure>
      <section className="container detail-body">
        <aside>
          <SectionLabel>THE PROJECT</SectionLabel>
          <div className="detail-tags">
            {project.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
          <Link className="text-link" href="/contact">
            Talk about this project <ArrowUpRight size={15} />
          </Link>
        </aside>
        <div className="article-prose">
          <h2>A world in the making.</h2>
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <Link className="button button-dark" href="/journal">
            Follow the studio journal <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <CollaborationCTA />
    </main>
  );
}
