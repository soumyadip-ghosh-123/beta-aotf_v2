import ReknownedSection from "@/components/ReknownedSection";
import OurServices from "@/components/OurServices";
import Testimonials from "@/components/Testimonials";
import ImageSlider from "@/components/ImageSlider";
import HeroDescription from "@/components/HeroDescription";
import { TimelineDemo } from "@/components/aceternity/TimelineDemo";
import FeatureSection from "@/components/home/FeatureSection";
import CTA from "@/components/home/CTA";
import Footer from "@/components/Footer";
import Dock from "@/components/reactbits/ui/Dock";
import { BriefcaseBusiness, GraduationCap, HomeIcon, User } from "lucide-react";
import BottomNav from "@/components/reactbits/bottomNav";

export default function Home() {
  return (
    <>
      <section className="flex w-full flex-col items-center justify-center">
        
        {/* <HeroSection /> */}
        {/* <ImagesSliderDemo /> */}
        <ImageSlider
          slides={[
            {
              src: "./image1.png",
              title: "First Slide",
              description: "This is the first image",
              buttonText: "Enquiry",
              link: "/enquiry",
            },
            {
              src: "./scatch_image.png",
              title: "Second Slide",
              description: "This is the second image",
              buttonText: "Join Now",
              link: "/join",
            },
            {
              src: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide3.png",
              title: "Third Slide",
              description: "This is the third image",
              buttonText: "Get Started",
              link: "/get-started",
            },
          ]}
          autoPlay
          interval={3000}
        />
        <HeroDescription />
        <ReknownedSection />
        <OurServices />
        <TimelineDemo />
        <Testimonials />
        {/* <Stats /> */}
        {/* <ScrollBanner /> */}
      </section>
      <Footer />
    </>
  );
}

//
