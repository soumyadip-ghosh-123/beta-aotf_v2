import { auth } from "@clerk/nextjs/server";
import Search from "@/components/Search";
import TuitionPost from "@/components/PostCards/TuitionPost";
import { FilterSidebarProvider } from "@/components/filter-sidebar-context";
import {
  getApplicantPermissionsByClerkId,
  getAppliedPostIdsForApplicant,
} from "@/lib/services/application.service";
import { listPosts } from "@/lib/services/post.service";

const EDITED_THRESHOLD_MS = 1000;

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    subjects?: string;
    boards?: string;
    classType?: string;
    minBudget?: number;
    maxBudget?: number;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || undefined;
  const status = (params.status as any) || "all";
  const subjects = params.subjects || undefined;
  const boards = params.boards || undefined;
  const classType = (params.classType as any) || undefined;
  const minBudget = params.minBudget || undefined;
  const maxBudget = params.maxBudget || undefined;
  const { userId: clerkId } = await auth();

  const { posts, pagination } = await listPosts({
    page,
    limit: 20,
    search,
    status,
    subjects,
    boards,
    classType,
    minBudget,
    maxBudget,
  });

  const applicantPermissions = clerkId
    ? await getApplicantPermissionsByClerkId(clerkId)
    : null;

  const appliedPostIds = applicantPermissions?.canApplyToPosts
    ? new Set(
        await getAppliedPostIdsForApplicant(
          applicantPermissions.applicantId,
          posts.map((post) => post.postId)
        )
      )
    : new Set<string>();

  const canApplyToPosts = clerkId
    ? applicantPermissions?.canApplyToPosts
    : undefined;

  return (
    <FilterSidebarProvider>
      <div className="flex flex-col items-center justify-center w-full px-2 mb-16">
        <Search />

        {posts.length === 0 ? (
          <p className="text-default-500 mt-10">No posts found</p>
        ) : (
          <div className="w-full max-w-md mt-6 space-y-4">
            {posts.map((post) => (
              <TuitionPost
                key={post.postId}
                postId={post.postId}
                enquiryId={post.enquiryId?.toString()}
                guardianName={post.guardianName}
                guardianPhone={post.guardianPhone}
                students={post.students}
                preferredTime={post.preferredTime}
                preferredDays={post.preferredDays}
                frequencyPerWeek={post.frequencyPerWeek}
                classType={post.classType}
                location={post.location}
                monthlyBudget={post.monthlyBudget}
                notes={post.notes}
                status={post.status}
                createdAt={post.createdAt}
                updatedAt={post.updatedAt}
                createdByUserId={{
                  name: post.author?.name,
                  avatar: post.author?.avatarUrl,
                }}
                initialApplied={appliedPostIds.has(post.postId)}
                isSignedIn={Boolean(clerkId)}
                canApply={canApplyToPosts}
                isEdited={
                  Boolean(post.updatedByAdminClerkId) ||
                  new Date(post.updatedAt).getTime() -
                    new Date(post.createdAt).getTime() >
                    EDITED_THRESHOLD_MS
                }
              />
            ))}
          </div>
        )}
      </div>
    </FilterSidebarProvider>
  );
}
