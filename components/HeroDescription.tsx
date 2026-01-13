import { Button } from "@heroui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import TextType from "./reactbits/ui/TextType";

const HeroDescription = () => {
  return (
    <section className="w-full my-10 flex flex-col lg:flex-row gap-5 max-md:gap-10 items-left justify-between">
      <div className="flex flex-col md:flex-col md:items-start justify-between">
        {/* <div className="flex flex-wrap items-center justify-center p-1.5 rounded-full border border-slate-400 text-gray-500 text-xs">
          <div className="flex items-center">
            <img
              className="size-7 rounded-full border-3 border-white"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50"
              alt="userImage1"
            />
            <img
              className="size-7 rounded-full border-3 border-white -translate-x-2"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50"
              alt="userImage2"
            />
            <img
              className="size-7 rounded-full border-3 border-white -translate-x-4"
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop"
              alt="userImage3"
            />
          </div>
          <p className="-translate-x-2">Join community of 1m+ founders </p>
        </div> */}
        <h1 className="font-semibold md:text-left text-3xl md:text-5xl md:leading-15 max-w-xl leading-10">
          Connecting
          <br />
          <TextType
            text={["Quality Educators", "Skilled Professionals"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="_"
            className="inline-block text-3xl md:text-5xl font-semibold text-[#ff9f51]"
          />
          {/* <span className="text-[#ff9f51]"> Quality Educators </span>
          <span className="text-[#ff9f51]">Skilled Professionals</span>  */}
          <br />
          <span className="bg-[#2e8b57] text-white"> Across India</span>
        </h1>
        <p className="md:text-left text-sm max-w-lg mt-2">
          Built on trust and transparency, AOTF makes it easy to find the right
          tutor or professional with confidence.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <Button
            radius="full"
            className="text-white hover:-translate-y-0.5 transition bg-linear-to-r from-indigo-600 to-[#8A7DFF] active:scale-95 px-7"
          >
            Make an Enquiry <ArrowRight />
          </Button>
          {/* <Button className="flex items-center gap-2 border transition rounded-md px-6">
            <span>Watch demo</span>
          </Button> */}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img
          src="./academy.png"
          alt="hero"
          className="h-auto w-auto transition-all duration-300 hover:scale-102 rounded-xl"
        />
      </div>
    </section>
  );
};

export default HeroDescription;
