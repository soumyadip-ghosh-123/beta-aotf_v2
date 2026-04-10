import BackButton from "@/components/BackButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | AOTF",
  description:
    "Explore AOTF services including 1:1 tutoring, batch tuition, doorstep teaching, and freelance & job-based professional hiring across India.",
};

export default function ServicesPage() {
  return (
    <>
      <BackButton title="Our Services" />
      <main className="mx-auto max-w-7xl px-6 py-5">
        {/* Header */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Our Services
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Academy of Tutorials & Freelancers (AOTF) is a dual-service
            marketplace that connects guardians with trusted teachers and
            clients with skilled professionals through a transparent and
            structured platform.
          </p>
        </section>

        {/* Tutorial Services */}
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-semibold text-gray-900">
            Tutorial & Teaching Services
          </h2>
          <p className="mb-10 max-w-4xl text-gray-600">
            AOTF provides reliable tuition solutions for students from KG to PhD
            across all academic streams. Our teaching services are designed to
            match the right teacher to the right student based on subject,
            location, learning mode, and academic requirements.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <ServiceCard
              title="1:1 Personalized Tuition"
              description="Dedicated one-on-one teaching where a single teacher focuses exclusively on one student, ensuring personalized attention, customized learning pace, and measurable academic improvement."
            />
            <ServiceCard
              title="Batch Tuition Services"
              description="Structured group teaching where one teacher instructs multiple students together. Ideal for collaborative learning, exam preparation, and cost-effective education."
            />
            <ServiceCard
              title="Doorstep / At-Home Teaching"
              description="Qualified teachers travel to the student’s residence to conduct in-person classes, ensuring comfort, safety, and focused learning in a familiar environment."
            />
            <ServiceCard
              title="Online Tuition"
              description="Flexible online classes conducted through digital platforms, suitable for students seeking remote learning or teachers outside the local area."
            />
            <ServiceCard
              title="All Classes & Boards Covered"
              description="Tuition services available for KG to PhD across CBSE, ICSE, ISC, IB, State Boards, and university-level syllabi in all departments."
            />
            <ServiceCard
              title="Extra-Curricular Teaching"
              description="Professional instructors for activities such as swimming, drawing, martial arts, foreign languages (German, Japanese, Korean, Chinese), and other skill-based learning."
            />
          </div>
        </section>

        {/* Freelancer Services */}
        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-semibold text-gray-900">
            Freelancer & Professional Services
          </h2>
          <p className="mb-10 max-w-4xl text-gray-600">
            AOTF connects individuals, startups, and businesses with skilled
            freelancers and professionals for part-time, full-time, and
            project-based work across multiple domains.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <ServiceCard
              title="Freelance Project Hiring"
              description="Clients can post project requirements and receive applications from verified freelancers based on skills, experience, and budget."
            />
            <ServiceCard
              title="Part-Time Opportunities"
              description="Flexible job opportunities for professionals and students seeking part-time roles across technical and non-technical domains."
            />
            <ServiceCard
              title="Full-Time Job Requirements"
              description="Businesses can hire professionals for full-time roles with structured application and admin-reviewed hiring workflows."
            />
            <ServiceCard
              title="Multi-Domain Talent Pool"
              description="Access talent across software development, design, marketing, data, content writing, operations, teaching, and more."
            />
            <ServiceCard
              title="PAN India Availability"
              description="Freelancer and job services are available across India, enabling remote and location-independent hiring."
            />
            <ServiceCard
              title="Skill-Based Matching"
              description="Applicants are matched based on skills, experience level, availability, and client-defined requirements."
            />
          </div>
        </section>

        {/* Platform Value */}
        <section className="rounded-2xl bg-gray-50 p-10">
          <h2 className="mb-6 text-3xl font-semibold text-gray-900">
            Why Choose AOTF
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            <ValuePoint text="Verified teachers, freelancers, and clients" />
            <ValuePoint text="Transparent application and approval process" />
            <ValuePoint text="Admin-monitored platform for quality control" />
            <ValuePoint text="Secure payments and structured onboarding" />
            <ValuePoint text="Support for both education and professional hiring" />
            <ValuePoint text="Designed for scalability and trust" />
          </ul>
        </section>
      </main>
    </>
  );
}

/* -------------------- Components -------------------- */

function ServiceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ValuePoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-gray-700">
      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
      <span>{text}</span>
    </li>
  );
}
