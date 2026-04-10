import BackButton from "@/components/BackButton";
import { siteConfig } from "@/config/site";

export default function Page() {
  return (
    <div>
      <BackButton title="Refund Policy" />
      <div className="py-8 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto px-4 md:px-8 pb-10">
          <div className=" mx-auto prose prose-gray dark:prose-invert bg-white/80 dark:bg-gray-950/80 rounded-lg p-8 shadow-md">
            <div className="pb-4 mb-6 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-4xl font-bold tracking-tight mb-0">
                Refund Policy
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Last updated: {siteConfig.lastUpdated}
              </p>
            </div>

            {/* TEACHERS */}
            <h2 className="text-2xl mt-6 mb-2 font-semibold">
              Refunds for Teachers
            </h2>
            <p>Refunds for Teachers apply only when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The tuition is discontinued by the guardian within the first
                month; and
              </li>
              <li>
                The discontinuation is not due to the Teacher&apos;s fault; and
              </li>
              <li>
                Proper documentation (such as written proof from the guardian)
                is submitted within <strong>7 days</strong> of discontinuation.
              </li>
            </ul>

            <h3 className="text-xl mt-6 mb-2 font-semibold">
              Refund Amount (Teachers)
            </h3>
            <p>
              Eligible Teachers shall receive{" "}
              <strong>50% of the first month&apos;s remuneration</strong> under
              both fee structures. Refunds will be issued via bank transfer
              within <strong>10 business days</strong> of approval.
            </p>

            <h3 className="text-xl mt-6 mb-2 font-semibold">
              Ineligibility (Teachers)
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Discontinuation caused by the Teacher&apos;s misconduct, poor
                communication, negligence, or unprofessional behavior.
              </li>
              <li>
                Failure to provide verifiable proof of discontinuation within
                the required timeline.
              </li>
              <li>
                Engaging in <strong>direct financial transactions</strong> with
                guardians without Academy approval.
              </li>
            </ul>

            <hr className="my-8 border-gray-200 dark:border-gray-800" />

            {/* Candidates/Job-seekers */}
            <h2 className="text-2xl mt-6 mb-2 font-semibold">
              Refunds for Candidates/Job-seekers
            </h2>
            <p>
              Refunds for Candidates/Job-seekers apply based on project
              milestones:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If a Client discontinues the project for personal or unavoidable
                reasons, the Freelancer will receive payment for{" "}
                <strong>completed and approved milestones only</strong>.
              </li>
              <li>
                If the project is discontinued due to Freelancer-related issues
                (delays, lack of response, poor quality work, or misconduct), no
                payments will be guaranteed.
              </li>
              <li>
                Any advance or milestone payment is non-refundable once the
                Freelancer has begun work.
              </li>
            </ul>

            <h3 className="text-xl mt-6 mb-2 font-semibold">
              Payment Validity (Candidates/Job-seekers)
            </h3>
            <p>
              All milestone-based payments are processed only through the
              Academy&apos;s official channels and will be released within{" "}
              <strong>7–10 business days</strong> after Client approval.
            </p>

            <hr className="my-8 border-gray-200 dark:border-gray-800" />

            {/* CLIENTS / GUARDIANS */}
            <h2 className="text-2xl mt-6 mb-2 font-semibold">
              Refunds for Clients / Guardians
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                A refund request must be made within <strong>7 days</strong> of
                allocation if the Teacher/Freelancer fails to start the service.
              </li>
              <li>
                If the Client decides not to proceed after assigning a
                Teacher/Freelancer, a <strong>service fee</strong> may be
                deducted.
              </li>
              <li>
                No refund will be issued once:
                <ul className="list-disc pl-6 mt-2">
                  <li>A tuition month has begun</li>
                  <li>A project milestone has been delivered</li>
                  <li>Work has already been initiated by a Freelancer</li>
                </ul>
              </li>
            </ul>

            <p className="mt-4">
              Clients/Guardians must raise disputes only through official
              Academy channels.
            </p>

            <hr className="my-8 border-gray-200 dark:border-gray-800" />

            {/* MODE OF REFUND */}
            <h2 className="text-2xl mt-6 mb-2 font-semibold">Mode of Refund</h2>
            <p>
              All refunds shall be processed{" "}
              <strong>only through official bank transfers</strong>. The Academy
              does not issue cash refunds, UPI refunds, or third-party wallet
              payments.
            </p>

            <hr className="my-8 border-gray-200 dark:border-gray-800" />

            {/* FINALITY */}
            <h2 className="text-2xl mt-6 mb-2 font-semibold">
              Decision Finality
            </h2>
            <p>
              The Academy&apos;s management holds the final decision-making
              authority on all refund, payment, and dispute matters. All
              parties—Teachers, Candidates/Job-seekers, and Clients—agree that
              the Academy&apos;s decision shall be final and binding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
