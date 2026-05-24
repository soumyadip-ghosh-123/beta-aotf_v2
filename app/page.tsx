import ReknownedSection from "@/components/ReknownedSection";
import OurServices from "@/components/OurServices";
import Testimonials from "@/components/Testimonials";
import ImageSlider from "@/components/ImageSlider";
import HeroDescription from "@/components/HeroDescription";
import { TimelineDemo } from "@/components/aceternity/TimelineDemo";
import Footer from "@/components/Footer";
import LeadershipCard from "@/components/home/LeadershipCard";

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
              title: "Find a Tutor",
              // description in 5 -6 words
              description: "Discover personalized learning with trusted tutors",
              buttonText: "Find Tuitions",
              link: "/posts",
            },
            {
              src: "./scatch_image.png",
              title: "Hire a Freelancer",
              description: "Connect with verified freelancers for your projects",
              buttonText: "Find Jobs",
              link: "/jobs",
            },
            {
              src: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide3.png",
              title: "Join as Educator",
              description: "Share your knowledge and earn by teaching students",
              buttonText: "Join Now",
              link: "/sign-up",
            },
          ]}
          autoPlay
          interval={3000}
        />
        <HeroDescription />
        <div className="grid grid-cols-1 gap-6 ">
          <LeadershipCard
            name="John Doe"
            role="CEO"
            image="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
            quote="Vision drives everything."
          />
          <LeadershipCard
            name="John Doe"
            role="CEO"
            image="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
            quote="Vision drives everything."
          />
        </div>
        <OurServices />
        <ReknownedSection />
        <TimelineDemo />
        <Testimonials />
        {/* <Stats /> */}
        {/* <ScrollBanner /> */}
      </section>
      <Footer />
    </>
  );
}