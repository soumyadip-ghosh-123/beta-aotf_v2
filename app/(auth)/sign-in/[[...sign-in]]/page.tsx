import { SignIn } from "@clerk/nextjs";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const linkMode = mode === "link-account";

  return (
    <div className="w-full max-w-md space-y-3">
      {linkMode ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          This account already exists. Sign in to the same account, and we will
          guide you to add password login as an additional sign-in method.
        </div>
      ) : null}

      <SignIn
        forceRedirectUrl={linkMode ? "/verify/link-account" : undefined}
        fallbackRedirectUrl={linkMode ? "/verify/link-account" : undefined}
      />
    </div>
  );
}
