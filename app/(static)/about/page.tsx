import BackButton from "@/components/BackButton";
import LeadershipCard from "@/components/home/LeadershipCard";
import Leadership from "@/components/home/LeadershipCard";
import Stats from "@/components/home/Stats";
import { title } from "@/components/primitives";
import { Card, CardHeader } from "@heroui/card";
import Image from "next/image";
import { FiTarget } from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="space-y-6 px-3">
      <BackButton title="About Us" />
      <Card className="max-w-3xl mx-auto ">
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
      <Card className="max-w-3xl mx-auto ">
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
        <Card className="max-w-3xl mx-auto ">
          <CardHeader>
            <FiTarget className="inline-block mr-2 text-2xl" />
            <h1 className="text-2xl font-bold text-left">Our Mission</h1>
          </CardHeader>
          <p className="text-lg text-left px-3">
            Our mission is to empower learners.
          </p>
        </Card>
        <Card className="max-w-3xl mx-auto ">
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

      <LeadershipCard
        name="John Doe"
        role="CEO"
        image="/profile.jpg"
        quote="Vision drives everything."
      />

      <section className="px-4 pt-4 pb-8">
        <div className="rounded-xl bg-linear-to-br from-primary to-blue-600 p-6 text-center text-white shadow-lg shadow-blue-500/20">
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
