import Auth from "@/components/home/Auth";
import Stats from "@/components/home/Stats";
import FeatureSection from "@/components/home/FeatureSection";
import CTA from "@/components/home/CTA";
import HeroSection from "@/components/home/HeroSection";
import ButtonGroup from "@/components/ButtonGroup";
import { FcPrivacy } from "react-icons/fc";
import { ScrollShadow } from "@heroui/scroll-shadow";

export default function Home() {
  const buttonGroups = [
    {
      icon: <FcPrivacy size={22} className="inline-block mr-1" />,
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center justify-center gap-8">
      <HeroSection />
      <div className="flex flex-col items-center gap-3">
        <Auth />
        <FeatureSection />
        {/* <Stats /> */}
        {/* Slide banner */}

        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          We are assosiated with
        </h1>
        <ScrollShadow
          className="max-w-sm max-h-75 no-scrollbar p-3"
          orientation="horizontal"
        >
          <div className="flex gap-2 px-4">
            {/* 6 buttons */}
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex h-20 w-40 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg"
              >
                Brand with name {i + 1}
              </div>
            ))}
          </div>
        </ScrollShadow>
        <CTA />
        {buttonGroups.map((item, index) => (
          <ButtonGroup
            key={index}
            icon={item.icon}
            title={item.title}
            link={item.link}
          />
        ))}
      </div>
    </section>
  );
}


// 