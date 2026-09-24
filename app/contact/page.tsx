import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactMap from "@/src/components/ContactMap";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact KenyalangKu in Kuching, Sarawak, about our games, collaborations, and studio.",
};

export default function Contact() {
  return (
    <main id="main" className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}><i aria-hidden="true" /> CONTACT / KENYALANGKU</p>
          <h1>We’d love to <span>hear from you.</span></h1>
          <p className={styles.lede}>A small independent studio rooted in Kuching, Sarawak — open to stories, ideas, and conversations from everywhere.</p>
        </header>

        <section className={styles.mapSection} aria-label="Where to find KenyalangKu">
          <ContactMap />
        </section>

        <section className={styles.channels} aria-label="Contact details">
          <article className={styles.channel}>
            <Mail className={styles.icon} aria-hidden="true" strokeWidth={1.5} />
            <h2>Email</h2>
            <p>For collaborations, questions, or a hello.</p>
            <a href="mailto:kenyalangku@gmail.com">kenyalangku@gmail.com</a>
          </article>
          <article className={styles.channel}>
            <MapPin className={styles.icon} aria-hidden="true" strokeWidth={1.5} />
            <h2>Studio location</h2>
            <p>Our home in East Malaysia.</p>
            <span>Kuching, Sarawak</span>
          </article>
          <article className={styles.channel}>
            <Phone className={styles.icon} aria-hidden="true" strokeWidth={1.5} />
            <h2>Phone</h2>
            <p>Please reach us by email.</p>
            <span>Unavailable</span>
          </article>
        </section>

        <p className={styles.coordinates}>MALAYSIA / OPEN TO THE WORLD <span>01°33′ N · 110°21′ E</span></p>
      </div>
    </main>
  );
}
