import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { articles } from "@/src/lib/content";
import { BackLink, SectionLabel } from "@/src/components/StudioUI";
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return {
    title: article?.title ?? "Story not found",
    description: article?.excerpt,
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  const next = articles[(articles.indexOf(article) + 1) % articles.length];
  return (
    <main id="main">
      <article className="container journal-article">
        <BackLink href="/journal">Back to the journal</BackLink>
        <SectionLabel>
          {article.category} · {article.readTime}
        </SectionLabel>
        <h1>{article.title}</h1>
        <p className="article-deck">{article.excerpt}</p>
        <div className="article-byline">
          <span className="byline-symbol">K</span>
          <div>
            From KenyalangKu<small>STUDIO PERSPECTIVES</small>
          </div>
        </div>
        <figure className="article-cover">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 900px"
          />
        </figure>
        <div className="article-prose">
          {article.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="next-article">
          <span className="small-label">THE NEXT STORY</span>
          <Link href={`/journal/${next.slug}`}>
            {next.title}
            <ArrowUpRight />
          </Link>
        </div>
      </article>
    </main>
  );
}
