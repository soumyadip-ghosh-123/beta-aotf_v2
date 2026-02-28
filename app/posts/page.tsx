import Search from "@/components/Search";
import TuitionPost from "@/components/PostCards/TuitionPost";
import { FilterSidebarProvider } from "@/components/filter-sidebar-context";
import { listPosts } from "@/lib/services/post.service";

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || undefined;
  const status = (params.status as any) || "all";

  const { posts, pagination } = await listPosts({
    page,
    limit: 20,
    search,
    status,
  });

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
              />
            ))}
          </div>
        )}
      </div>
    </FilterSidebarProvider>
  );
}
