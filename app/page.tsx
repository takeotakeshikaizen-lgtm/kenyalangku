import HeroSection from "@/src/sections/HeroSection";
import WhySection from "@/src/sections/WhySection";
import ProjectsSection from "@/src/sections/ProjectsSection";

import SiteFooter from "@/src/components/SiteFooter";
import ScrollToTop from "@/src/components/ScrollToTop";

export default function Home() {
  return (
    <>
      <main id="top">
        <HeroSection />

        <WhySection />

        <ProjectsSection />
      </main>

      <SiteFooter />

      <ScrollToTop />
    </>
  );
}