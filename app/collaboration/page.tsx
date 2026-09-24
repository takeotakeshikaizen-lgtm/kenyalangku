import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Brush, Handshake, Users } from "lucide-react";
import {
  PageIntro,
  SectionLabel,
  CollaborationCTA,
} from "@/src/components/StudioUI";
import PartnerSlider from "@/src/components/PartnerSlider";
export const metadata: Metadata = {
  title: "Collaboration",
  description:
    "Connect with KenyalangKu. Explore creative collaboration, publishing, investment, and community opportunities.",
};
export default function Collaboration() {
  const opportunities = [
    {
      icon: Brush,
      title: "Create with us.",
      label: "ARTISTS & DEVELOPERS",
      text: "Bring your perspective to the worlds we’re making. Art, code, sound, storytelling — good work starts with a shared idea.",
    },
    {
      icon: Handshake,
      title: "Believe in what’s next.",
      label: "INVESTORS & PUBLISHERS",
      text: "Connect with a studio building original Malaysian game IP. Start a conversation about our projects, direction, and future.",
    },
    {
      icon: Users,
      title: "Make connections matter.",
      label: "COMMUNITIES & CULTURAL VOICES",
      text: "Help us build meaningful connections between Malaysian culture, local creative talent, and the international games industry.",
    },
  ];
  return (
    <main id="main">
      <PageIntro
        label="BETTER WORLDS, TOGETHER"
        title="Shared ideas."
        emphasis="Greater possibilities."
        description="We’re open to conversations with people who believe in thoughtful games, local creativity, and Malaysian stories with global potential."
      />
      <PartnerSlider />
      <section className="section container">
        <SectionLabel>FIND YOUR PART IN THE STORY</SectionLabel>
        <h2 className="standalone-heading">
          There’s more than one way
          <br />
          <em>to build a world.</em>
        </h2>
        <div className="opportunity-grid">
          {opportunities.map((item) => (
            <article key={item.title}>
              <item.icon size={30} strokeWidth={1.1} />
              <span className="small-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link className="text-link" href="/contact">
                Let’s connect <ArrowUpRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        <p className="collection-note">
          KrackedDevs is part of our AI community. Unreal Engine is
          technology we use; its inclusion does not imply a partnership or
          endorsement by Epic Games.
        </p>
      </section>
      <CollaborationCTA />
    </main>
  );
}
