import BackButton from "@/components/BackButton";
import { title } from "@/components/primitives";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <BackButton title="" />
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="mb-10">
          {/* Header */}
          <div className="pb-4 mb-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-4xl font-bold tracking-tight mb-0">
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated on: {siteConfig.lastUpdated}
            </p>
          </div>

          <p>
            <strong>Academy of Tutorials and Freelancers</strong> (“the
            Academy,” “we,” “our,” or “us”) is committed to protecting the
            personal information of all individuals who interact with our
            services. This includes teachers, students, guardians, clients
            seeking services, and Candidates/Job-seekers providing services.
            This Privacy Policy describes how we collect, store, use, disclose,
            and safeguard your information across our website, mobile
            applications, and any offline communication channels.
          </p>

          {/* 1. Information We Collect */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            1. Information We Collect
          </h2>
          <p>We collect the following categories of personal information:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">
                a. Information you provide to us directly:
              </span>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Full name, phone number, email address, and physical address.
                </li>
                <li>
                  Educational qualifications, skill details, résumé/portfolio
                  (for teachers and Candidates/Job-seekers).
                </li>
                <li>
                  Student details, academic needs, and tutoring requirements
                  (for guardians).
                </li>
                <li>
                  Project requirements and business details (for clients).
                </li>
                <li>
                  Payment information and bank account details for payouts or
                  refunds.
                </li>
              </ul>
            </li>

            <li>
              <span className="font-medium">
                b. Automatically collected data:
              </span>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address, browser type, device information.</li>
                <li>
                  Login timestamps, page views, interaction logs, and
                  click-stream data.
                </li>
                <li>
                  Cookies and tracking identifiers to improve security and
                  performance.
                </li>
              </ul>
            </li>

            <li>
              <span className="font-medium">
                c. Financial & sensitive information:
              </span>
              Collected only when required for secure payment processing and
              identity verification.
            </li>
          </ul>

          {/* 2. Purpose of Data Collection */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            2. Purpose of Data Collection
          </h2>
          <p>Your data is used for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              To match teachers with students and Candidates/Job-seekers with
              clients.
            </li>
            <li>
              To verify identity, prevent fraud, and maintain platform safety.
            </li>
            <li>To process payments, payouts, refunds, and commissions.</li>
            <li>To personalize user experience and improve service quality.</li>
            <li>
              To send notifications, updates, reminders, and support responses.
            </li>
            <li>
              To comply with applicable laws, regulations, and government
              requirements.
            </li>
          </ul>

          {/* 3. Consent */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">3. Consent</h2>
          <p>
            By signing up or using our platform, you agree to our collection and
            use of your personal information as described in this Privacy
            Policy. You may withdraw consent at any time by contacting us;
            however, certain services may become unavailable as a result.
          </p>

          {/* 4. Data Sharing */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            4. Data Sharing and Disclosure
          </h2>
          <p>
            We do <strong>not</strong> sell your personal data. Your information
            may be shared only under the following circumstances:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              With teachers, guardians, clients, or Candidates/Job-seekers
              solely for matching and service facilitation.
            </li>
            <li>
              With banks, payment gateways, and authorized processors for
              legitimate transactions.
            </li>
            <li>With government or legal authorities when required by law.</li>
            <li>
              With trusted third-party services (e.g., hosting, email, storage)
              that operate under confidentiality and data protection agreements.
            </li>
          </ul>

          {/* 5. Data Retention */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            5. Data Storage and Retention
          </h2>
          <p>
            All personal data is stored securely on encrypted servers and
            systems. We retain your data only for as long as necessary to
            fulfill the purposes described above or to comply with legal
            obligations.
          </p>

          {/* 6. Data Security */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">6. Data Security</h2>
          <p>
            We employ strict administrative, technical, and physical security
            measures, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>SSL encryption for web traffic and sensitive transactions.</li>
            <li>
              Access controls, authentication workflows, and password hashing.
            </li>
            <li>
              Routine audits, security monitoring, and threat detection systems.
            </li>
          </ul>
          <p>
            Despite our best efforts, no system is completely immune to security
            risks. Use of our platform is at your own discretion and risk.
          </p>

          {/* 7. User Rights */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">7. Your Rights</h2>
          <p>
            You may exercise the following rights under Indian privacy
            standards:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Access:</span> Request a copy of
              your personal data.
            </li>
            <li>
              <span className="font-medium">Correction:</span> Request updates
              or corrections to inaccurate data.
            </li>
            <li>
              <span className="font-medium">Deletion:</span> Request removal of
              data no longer required.
            </li>
            <li>
              <span className="font-medium">Withdrawal of Consent:</span>{" "}
              Opt-out of data processing practices.
            </li>
          </ul>

          <p>
            To exercise your rights, contact us at:{" "}
            <Link
              href={`mailto:${siteConfig.contact.email}`}
              className="text-blue-600 hover:underline"
            >
              {siteConfig.contact.email}
            </Link>
          </p>

          {/* 8. Cookies */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            8. Cookies and Tracking
          </h2>
          <p>
            Our platform uses cookies to improve user experience, enable login
            sessions, and analyze platform usage. You can disable cookies from
            your browser settings; however, some platform features may not
            function correctly afterward.
          </p>

          {/* 9. Third-Party Links */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            9. Third-Party Links
          </h2>
          <p>
            Our website may contain external links. We are not responsible for
            the privacy practices, content, or security of those third-party
            websites.
          </p>

          {/* 10. Changes */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be
            reflected by the “Last Updated” date above. Continued use of our
            services after updates signifies acceptance of the revised policy.
          </p>

          {/* 11. Contact */}
          <h2 className="text-2xl mt-8 mb-2 font-semibold">
            11. Contact Information
          </h2>
          <p>For any privacy-related questions, please reach us at:</p>

          <ul className="list-none pl-0">
            <li>
              <span className="font-medium">
                Academy of Tutorials and Candidates/Job-seekers
              </span>
            </li>
            <li>Kolkata, West Bengal, India</li>
            <li>
              Email:{" "}
              <Link
                href={`mailto:${siteConfig.contact.email}`}
                className="text-blue-600 hover:underline"
              >
                {siteConfig.contact.email}
              </Link>
            </li>
            <li>Phone: {siteConfig.contact.phone}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
