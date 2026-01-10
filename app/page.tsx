import Auth from "@/components/home/Auth";
import Stats from "@/components/home/Stats";
import FeatureSection from "@/components/home/FeatureSection";
import CTA from "@/components/home/CTA";
import HeroSection from "@/components/home/HeroSection";
import ButtonGroup from "@/components/ButtonGroup";
import { FcPrivacy } from "react-icons/fc";
import { ScrollShadow } from "@heroui/scroll-shadow";
import ScrollBanner from "@/components/ScrollBanner";
import ReknownedSection from "@/components/ReknownedSection";

export default function Home() {


  return (
    <section className="flex w-full flex-col items-center justify-center gap-6">
      <HeroSection />
      <div className="flex flex-col md:flex-row-reverse items-center gap-8">
        <Auth />
        <div className="flex flex-col h-full gap-4 flex-1 p-4 sm:p-0">
          <FeatureSection />
          <CTA />
        </div>
      </div>
      {/* <Stats /> */}
      {/* <ScrollBanner /> */}
      <ReknownedSection />
      
    </section>
  );
}

//
