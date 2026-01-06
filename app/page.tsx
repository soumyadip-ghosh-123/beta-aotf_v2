import Auth from "@/components/home/Auth";
import Stats from "@/components/home/Stats";
import FeatureSection from "@/components/home/FeatureSection";
import CTA from "@/components/home/CTA";
import HeroSection from "@/components/home/HeroSection";
import { Button, ButtonGroup } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { FaChevronRight } from "react-icons/fa";
import { FcPrivacy } from "react-icons/fc";

export default function Home() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8">
      <HeroSection />
      <div className="flex flex-col items-center gap-3">
        <Auth />
        <FeatureSection />
        <Stats />
        <CTA />

        <section className="w-full max-w-md px-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 dark:divide-slate-700">
            <Button
              className="w-full rounded-none justify-between bg-white"
              size="lg"
            >
              <span>
                <FcPrivacy size={22} className="inline-block mr-1" />
                Privacy Policy
              </span>
              <FaChevronRight size={18} className="inline-block" />
            </Button>
            <Divider />
            <Button
              className="w-full rounded-none justify-between bg-white"
              size="lg"
            >
              <span>
                <FcPrivacy size={22} className="inline-block mr-1" />
                Refund Policy
              </span>
              <FaChevronRight size={18} className="inline-block" />
            </Button>
            <Divider />
            <Button
              className="w-full rounded-none justify-between bg-white"
              size="lg"
            >
              <span>
                <FcPrivacy size={22} className="inline-block mr-1" />
                Terms of Service
              </span>
              <FaChevronRight size={18} className="inline-block" />
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
