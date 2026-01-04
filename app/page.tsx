import Auth from "@/components/home/Auth";
import Stats from "@/components/home/Stats";
import FeatureSection from "@/components/home/FeatureSection";
import CTA from "@/components/home/CTA";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8">
      <HeroSection />
      <div className="flex flex-col items-center gap-3">
        <Auth />
        <Stats />
        <FeatureSection />
        <CTA />
      </div>
    </section>
  );
}
