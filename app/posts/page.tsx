import Search from "@/components/Search";
import { FilterSidebarProvider } from "@/components/filter-sidebar-context";
import PostInfiniteFeed from "@/components/PostInfiniteFeed";
import { listPublicAds } from "@/lib/services/ad.service";
import { listPosts } from "@/lib/services/post.service";

const PAGE_SIZE = 10;

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

  const { posts, pagination } = await listPosts({
    page,
    limit: PAGE_SIZE,
    search,
    status,
    subjects,
    boards,
    classType,
    minBudget,
    maxBudget,
  });
  const [featuredAd] = await listPublicAds({
    placement: "feed_inline",
    limit: 1,
  });

  const initialPosts = JSON.parse(JSON.stringify(posts));
  const initialPagination = JSON.parse(JSON.stringify(pagination));
  const initialFeaturedAd = featuredAd ? JSON.parse(JSON.stringify(featuredAd)) : null;

  return (
    <FilterSidebarProvider>
      <div className="flex flex-col items-center justify-center w-full px-2 mb-16">
        <Search />
        <PostInfiniteFeed
          initialPosts={initialPosts}
          initialPagination={initialPagination}
          featuredAd={initialFeaturedAd}
          filters={{
            search,
            status,
            subjects,
            boards,
            classType,
            minBudget: minBudget?.toString(),
            maxBudget: maxBudget?.toString(),
          }}
        />
      </div>
    </FilterSidebarProvider>
  );
}
