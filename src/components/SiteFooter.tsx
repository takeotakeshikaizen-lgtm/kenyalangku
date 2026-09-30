/* Full document links are required: Home is a standalone WebGL document. */
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";
import { Gamepad2, Link2, Mail } from "lucide-react";
import FooterNewsletter from "@/src/components/FooterNewsletter";

export default function SiteFooter() {
  return (
    <footer className="kk-footer" aria-label="KenyalangKu footer">
      <div className="kk-footer__inner">
        <div className="kk-footer__grid">
          <nav className="kk-footer__sitemap" aria-label="Footer sitemap">
            <div className="kk-footer__column">
              <span className="kk-footer__capsule">COMPANY</span>
              <a href="/about">About us</a>
              <a href="/#vision">Our vision</a>
              <a href="/contact">Contact</a>
            </div>
            <div className="kk-footer__column">
              <span className="kk-footer__capsule">GAMES</span>
              <a href="/projects">All projects</a>
              <a href="/projects/pusaka">PUSAKA</a>
              <a href="/projects/myth-tanah">MYTH: TANAH</a>
            </div>
            <div className="kk-footer__column">
              <span className="kk-footer__capsule">RESOURCES</span>
              <a href="/#vision">Mission & objective</a>
              <a href="#footer-updates">Studio updates</a>
            </div>
            <div id="connections" className="kk-footer__column">
              <span className="kk-footer__capsule">CONNECT</span>
              <a href="/collaboration">Collaborate</a>
              <a href="mailto:kenyalangku@gmail.com">Email the studio</a>
              <a href="https://krackeddevs.com/" target="_blank" rel="noopener noreferrer">KrackedDevs <small>AI COMMUNITY</small></a>
              <a href="https://www.unrealengine.com/" target="_blank" rel="noopener noreferrer">Unreal Engine <small>TECHNOLOGY WE USE</small></a>
            </div>
          </nav>
          <div className="kk-footer__side">
            <section id="footer-updates" className="kk-footer__newsletter" aria-labelledby="footer-updates-title">
              <div className="kk-footer__visual" aria-hidden="true"><Image src="/images/kenyalangku/kenyalangku-logo.png" alt="" width={94} height={94} /></div>
              <h2 id="footer-updates-title">Studio updates</h2>
              <p>Occasional updates on our games and worlds in progress.</p>
              <FooterNewsletter />
            </section>
            <div className="kk-footer__follow">
              <strong>Connect</strong>
              <nav aria-label="Ways to connect">
                <a href="/projects" aria-label="Explore KenyalangKu projects" title="Our projects"><Gamepad2 aria-hidden="true" /></a>
                <a href="mailto:kenyalangku@gmail.com" aria-label="Email KenyalangKu" title="Email"><Mail aria-hidden="true" /></a>
                <a href="/collaboration" aria-label="Collaborate with KenyalangKu" title="Collaborate"><Link2 aria-hidden="true" /></a>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <div className="kk-footer__wordmark">kenyalangku</div>
      <div className="kk-footer__legal kk-footer__inner">
        <span>© {new Date().getFullYear()} KENYALANGKU</span>
        <nav aria-label="Footer links"><a href="#main">BACK TO TOP ↑</a></nav>
      </div>
    </footer>
  );
}
