import BackButton from "@/components/BackButton";
import { title } from "@/components/primitives";

export default function DocsPage() {
  return (
    <div>
      <BackButton title="Privacy Policy" />
      <div className="prose dark:prose-invert max-w-3xl mx-auto px-4 py-6">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 10, 2024</p>
        <p>
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our
          services.
        </p>
      </div>
    </div>
  );
}
