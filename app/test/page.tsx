import Search from "@/components/Search";
import TuitionPost from "@/components/PostCards/TuitionPost";
import ClickSpark from "@/components/reactbits/ui/ClickSpark";
import ImageSlider from "@/components/ImageSlider";
import { TimelineDemo } from "@/components/aceternity/TimelineDemo";
import TextType from "@/components/reactbits/ui/TextType";
import Onboarding from "@/components/reactbits/Onboarding";
import { FaBook } from "react-icons/fa";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { IdCard } from "@/components/aceternity/IdCard";
export default function PricingPage() {
  const data = {
    postId: "P-25112500",
    subject: "Science",
    className: "8",
    board: 2 as const, // ICSE = 2
    preferredTime: "6 PM",
    preferredDays: ["Mon", "Wed", "Fri"],
    frequencyPerWeek: 2 as const, // twice = 2
    classType: 1 as const, // in-person = 1
    location: "Dhakuria near Metro Station",
    monthlyBudget: 2000,
    notes: "Only Female Teacher Required",
    status: 1 as const, // open = 1
    applicants: ["69254be157f77cfb98de0d6e", "69258aa32ef2dd07ebaae681"],
    createdAt: new Date("2025-11-25T06:10:16.434Z"),
    updatedAt: new Date("2025-11-25T10:55:23.704Z"),
    createdByUserId: { name: "Soumyadip", avatar: "" },
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      {/* <Search /> */}
      {/* <TuitionPost {...data} /> */}
      {/* Your content here */}
      {/* <ImagesSliderDemo /> */}
      {/* </div> */}
      {/* <ImageSlider
        slides={[
          {
            src: "https://images.unsplash.com/photo-1543269865-0a740d43b90c?q=80&w=800&h=400&auto=format&fit=crop",
            title: "First Slide",
            description: "This is the first image",
          },
          {
            src: "https://images.unsplash.com/photo-1543269865-0a740d43b90c?q=80&w=800&h=400&auto=format&fit=crop",
            title: "Second Slide",
            description: "This is the second image",
          },
          {
            src: "https://images.unsplash.com/photo-1543269865-0a740d43b90c?q=80&w=800&h=400&auto=format&fit=crop",
            title: "Third Slide",
            description: "This is the third image",
          },
        ]}
        autoPlay
        interval={3000}
      />
      <TimelineDemo /> */}
      {/* <TextType
        text={["Text typing effect", "for your websites", "Happy coding!"]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="_"
      /> */}
      {/* <Onboarding /> */}

      {/* educational content */}
      <IdCard />
    </div>
  );
}
