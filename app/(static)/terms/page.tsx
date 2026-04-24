import BackButton from "@/components/BackButton";
import { siteConfig } from "@/config/site";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";

export default function Page() {
  return (
    <div>
      <BackButton />
      <div className="mx-auto max-w-7xl px-6 pb-5">
        <div className="pb-4 mb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-0">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Last Updated: {siteConfig.lastUpdated}
          </p>
        </div>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 pt-6">
          {/* INTRODUCTION */}
          <section>
            <h1 className="font-bold text-2xl">1. Introduction</h1>
            <p>
              These Terms and Conditions (“Agreement”) govern the relationship
              between
              <strong> Academy of Tutorials and Freelancers</strong> (“the
              Academy”), holding Trade License No.{" "}
              <strong>0917P396725363505</strong>, and all individuals or
              entities (“Teachers”, “Clients/Guardians”, “Students”, and
              “Candidates/Job-seekers”) who use any service of the Academy,
              including tuition assignments, project-based freelance work, or
              skill-based services.
            </p>
          </section>

          <Divider />

          {/* NATURE OF SERVICE */}
          <section>
            <h2 className="font-bold text-2xl">2. Nature of Service</h2>
            <p>The Academy acts as an intermediary platform that:</p>
            <ul>
              <li>
                Connects <strong>Clients/Guardians</strong> with suitable
                <strong> Teachers</strong> for academic tuition.
              </li>
              <li>
                Connects <strong>Clients</strong> with verified
                <strong> Candidates/Job-seekers</strong> for project-based or
                skill-based services.
              </li>
            </ul>

            <p className="mt-4">
              The Academy does <strong>not</strong> employ Teachers or
              Candidates/Job-seekers; all operate as independent service
              providers. The Academy is responsible only for initial
              facilitation and is not liable for continuation, termination, or
              the quality of services delivered between the parties.
            </p>
          </section>

          <Divider />

          {/* FEE MODEL FOR TEACHERS AND Candidates/Job-seekers */}
          <section>
            <h2 className="font-bold text-2xl">3. Academy Fee Options</h2>
            <p>
              The fee model differs for Teachers and Candidates/Job-seekers:
            </p>

            <h3 className="font-bold text-xl mt-4">For Teachers</h3>
            <p>
              Teachers may choose the following payment structure prior to
              accepting an assignment:
            </p>
            <p>
              The Teacher pays <strong>75%</strong> of the first month’s
              remuneration as an “Academy Fee.” The remaining{" "}
              <strong>25%</strong> is released to the Teacher by the Academy.
            </p>

            <h3 className="font-bold text-xl mt-6">
              For Candidates/Job-seekers
            </h3>
            <ul>
              <li>
                The Academy charges a <strong>25% service commission</strong> on
                each freelance project and Job.
              </li>
              <li>
                The commission percentage will be clearly communicated before
                assigning a project.
              </li>
              <li>
                Direct payment between Client and Candidates/Job-seekers without
                Academy authorization is strictly prohibited for the first
                project.
              </li>
            </ul>
          </section>

          <Divider />

          {/* PAYMENT TERMS */}
          <section>
            <h2 className="font-bold text-2xl">4. Payment Terms</h2>
            <ul>
              <li>
                All payments must be made only to the
                <strong> official business bank account</strong> of the Academy.
              </li>
              <li>
                No Teacher or Freelancer shall accept direct payment from any
                Client for the first month/project unless approved by the
                Academy.
              </li>
              <li>
                Any unauthorized transaction may lead to suspension or removal
                from the Academy’s network.
              </li>
            </ul>
          </section>

          <Divider />

          {/* REFUND POLICY */}
          <section>
            <h2 className="font-bold text-2xl">
              5. Refund and Discontinuation Policy
            </h2>

            <h3 className="font-bold text-xl">For Teachers</h3>
            <ul>
              <li>
                If tuition is discontinued after the first month, the Teacher
                shall receive <strong>50%</strong> of the first month’s
                remuneration if valid proof is provided.
              </li>
              <li>
                Proof must confirm that termination was not due to Teacher’s
                fault.
              </li>
              <li>
                If discontinuation occurs due to Teacher-related issues,
                <strong>no refund</strong> will be issued.
              </li>
            </ul>

            <h3 className="font-bold text-xl mt-6">
              For Candidates/Job-seekers
            </h3>
            <ul>
              <li>
                If a project is discontinued due to Client-side reasons, the
                Candidates/Job-seekers will receive payment for completed
                milestones only.
              </li>
              <li>
                If discontinuation is due to Candidates/Job-seekers issues (poor
                communication, delay, misconduct), no payment will be
                guaranteed.
              </li>
            </ul>

            <p className="mt-4">
              The Academy reserves the right to make the final determination in
              all refund and dispute matters.
            </p>
          </section>

          <Divider />

          {/* TEACHER & FREELANCER CONDUCT */}
          <section>
            <h2 className="font-bold text-2xl">6. Conduct and Obligations</h2>

            <h3 className="font-bold text-xl">
              For Teachers & Candidates/Job-seekers
            </h3>
            <ul>
              <li>
                Maintain professionalism, punctuality, and respectful behavior.
              </li>
              <li>Ensure clear communication with Clients and the Academy.</li>
              <li>Avoid negligence, misconduct, or unprofessional actions.</li>
              <li>
                Any harmful, offensive, or unethical behavior may result in
                termination or blacklisting.
              </li>
            </ul>

            <h3 className="font-bold text-xl mt-6">For Clients/Guardians</h3>
            <ul>
              <li>Provide accurate requirements and expectations.</li>
              <li>
                Behave respectfully with Teachers, Candidates/Job-seekers, and
                Academy staff.
              </li>
              <li>Make timely payments to the Academy</li>
              <li>
                Not engage in unauthorized direct transactions or bypass the
                platform.
              </li>
            </ul>
          </section>

          <Divider />

          {/* LIABILITY */}
          <section>
            <h2 className="font-bold text-2xl">7. Limitation of Liability</h2>
            <ul>
              <li>
                The Academy is not liable for service quality after initial
                facilitation.
              </li>
              <li>
                The Academy is not responsible for disputes between Clients and
                Teachers/Candidates/Job-seekers.
              </li>
              <li>
                The Academy shall not be liable for indirect, incidental, or
                consequential damages.
              </li>
            </ul>
          </section>

          <Divider />

          {/* TERMINATION */}
          <section>
            <h2 className="font-bold text-2xl">
              8. Termination of Relationship
            </h2>
            <p>
              Either party may terminate the relationship by providing written
              notice. All pending dues or refunds will be settled as per the
              applicable policies.
            </p>
          </section>

          <Divider />
          {/* GOVERNING LAW */}
          <section>
            <h2 className="font-bold text-2xl">
              9. Governing Law & Dispute Resolution
            </h2>
            <p>
              This Agreement is governed by the laws of India under the
              <strong> Indian Contract Act, 1872</strong>. All disputes will
              fall under the jurisdiction of competent courts in
              <strong> Kolkata, West Bengal, India</strong>.
            </p>
          </section>

          <Divider />

          {/* ACKNOWLEDGMENT */}
          <section>
            <h2 className="font-bold text-2xl">10. Acknowledgment</h2>
            <p>
              By registering or using the Academy’s platform, all Teachers,
              Clients/Guardians, Students, and Candidates/Job-seekers
              acknowledge that they have read, understood, and agreed to these
              Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
