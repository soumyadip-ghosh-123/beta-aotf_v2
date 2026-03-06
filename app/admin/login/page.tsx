import { SignIn } from "@clerk/nextjs";

export default function AdminSignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SignIn
        forceRedirectUrl="/admin"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
