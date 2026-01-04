import Stats from "@/components/home/Stats";
import { title } from "@/components/primitives";
import { Card, CardHeader } from "@heroui/card";
import Image from "next/image";
import { FiTarget } from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">About Us</h1>
      <Card className="max-w-3xl mx-auto p-3">
        <CardHeader>
          <Image
            src="https://img.freepik.com/free-photo/smiling-business-team-standing-conference-room_1262-1963.jpg"
            alt="About Us"
            width={500}
            height={300}
            className="object-cover rounded-lg w-full"
          />
        </CardHeader>
        <h1 className="text-2xl font-bold text-left  px-3">Our Team</h1>
        <p className="text-lg text-left px-3">
          Welcome to our platform! We are dedicated to providing the best
          services to our users. Our mission is to connect learners with the
          resources they need to succeed. Thank you for being a part of our
          community.
        </p>
      </Card>
      <Card className="max-w-3xl mx-auto p-3">
        <CardHeader>
          <FiTarget className="inline-block mr-2 text-2xl" />
          <h1 className="text-2xl font-bold text-left">Our Vision</h1>
        </CardHeader>
        <p className="text-lg text-left px-3">
          Our vision is to create a world where education is accessible to all,
          regardless of their background or circumstances. We believe that every
          learner deserves the opportunity to thrive and reach their full
          potential.
        </p>
      </Card>
      <h1 className="text-2xl font-bold">What we do</h1>
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full ">
        <Card className="max-w-3xl mx-auto p-3">
          <CardHeader>
            <FiTarget className="inline-block mr-2 text-2xl" />
            <h1 className="text-2xl font-bold text-left">Our Mission</h1>
          </CardHeader>
          <p className="text-lg text-left px-3">
            Our mission is to empower learners.
          </p>
        </Card>
        <Card className="max-w-3xl mx-auto p-3">
          <CardHeader>
            <FiTarget className="inline-block mr-2 text-2xl" />
            <h1 className="text-2xl font-bold text-left">Learning</h1>
          </CardHeader>
          <p className="text-lg text-left px-3">
            Our mission is to empower learners.
          </p>
        </Card>
      </div>
      <Stats />

      <section className="px-4 pt-4">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight pb-3">
          Leadership
        </h3>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="relative size-16 shrink-0">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover rounded-full border-2 border-primary/20"
              data-alt="Portrait of CEO Soumyadip Ghosh"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBA21Pi3UxZGS0RthOB27BgeU-ccXgvv6WVlamsWPllnIX9eutdi4aXCIVWsiTOVlVxFqdNYfUqifEcEcng1Mv_mDaI5xJC71b-_0sqKKLStzxliUmo-elTcDer25HNE9DHLaB21akv6UH2UgucjuMeM21Pau71ziIoWFi4p7XKbE78ZAro21-diyaCmxqsk5tqSMGLXyEOD0OKgQj5HuSSRB6MPYV8uLeVZOn4nr-NKv9206CIEhh-T3zQKG1YTYm2673BnrZH2EU")',
              }}
            ></div>
          </div>
          <div className="flex flex-col justify-center relative z-10">
            <h4 className="text-slate-900 dark:text-white text-base font-bold">
              Soumyadip Ghosh
            </h4>
            <p className="text-primary text-sm font-medium mb-1">
              CEO &amp; Founder
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs italic">
              "Building the bridge between ambition and opportunity."
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4 pb-8">
        <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-6 text-center text-white shadow-lg shadow-blue-500/20">
          <h3 className="text-xl font-bold mb-2">Ready to start?</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-70 mx-auto">
            Join the Academy of Tutorials &amp; Freelancers community today.
          </p>
          <button className="w-full bg-white text-primary font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
