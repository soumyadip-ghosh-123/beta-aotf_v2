import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import BackButton from "@/components/BackButton";
import FeedbackForm from "@/components/FeedbackForm";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/u/${username}/feedback`)}`);
  }

  await dbConnect();
  const currentUser = await User.findOne({ clerkId }).lean<{
    username: string;
  }>();

  if (!currentUser || currentUser.username.toLowerCase() !== username.toLowerCase()) {
    notFound();
  }

  return (
    <>
      <BackButton title="Feedback" />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] w-full">
        <FeedbackForm />
      </div>
    </>
  );
}
