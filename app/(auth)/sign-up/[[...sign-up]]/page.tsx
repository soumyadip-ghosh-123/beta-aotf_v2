import BackButton from "@/components/BackButton";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <>
      <BackButton title="Sign Up" />
      <SignUp signInUrl="/sign-in?mode=link-account" />
    </>
  );
}
