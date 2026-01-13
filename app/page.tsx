import ReknownedSection from "@/components/ReknownedSection";
import OurServices from "@/components/OurServices";
import Testimonials from "@/components/Testimonials";
import ImageSlider from "@/components/ImageSlider";
import HeroDescription from "@/components/HeroDescription";
import { TimelineDemo } from "@/components/aceternity/TimelineDemo";

export default function Home() {
  return (
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
          },
          {
            src: "./scatch_image.png",
            title: "Second Slide",
            description: "This is the second image",
            buttonText: "Join Now",
          },
          {
            src: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide3.png",
            title: "Third Slide",
            description: "This is the third image",
            buttonText: "Get Started",
          },
        ]}
        autoPlay
        interval={3000}
      />
      <div className="flex flex-col md:flex-row-reverse items-center gap-8">
        <div className="flex flex-col h-full gap-4 flex-1 p-4 sm:p-0">
          {/* <FeatureSection /> */}
          {/* <CTA /> */}
        </div>
      </div>
      <HeroDescription />
      <ReknownedSection />
      <OurServices />
      <Testimonials />
      <TimelineDemo />
      {/* <Stats /> */}
      {/* <ScrollBanner /> */}
    </section>
  );
}

//
