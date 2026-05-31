import Search from "@/components/Search";
import { FilterSidebarProvider } from "@/components/filter-sidebar-context";
import JobInfiniteFeed from "@/components/JobInfiniteFeed";
import { listPublicAds } from "@/lib/services/ad.service";
import { listJobs } from "@/lib/services/job.service";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || undefined;
  const status = (params.status as any) || "all";
  const PAGE_SIZE = 10;

  const { jobs, pagination } = await listJobs({
    page,
    limit: PAGE_SIZE,
    search,
    status,
  });
  const [featuredAd] = await listPublicAds({
    placement: "feed_inline",
    limit: 1,
  });

  const initialJobs = JSON.parse(JSON.stringify(jobs));
  const initialPagination = JSON.parse(JSON.stringify(pagination));
  const initialFeaturedAd = featuredAd ? JSON.parse(JSON.stringify(featuredAd)) : null;

  return (
    <FilterSidebarProvider>
      <div className="flex flex-col items-center justify-center w-full px-2 mb-16">
        <Search />
        <JobInfiniteFeed
          initialJobs={initialJobs}
          initialPagination={initialPagination}
          filters={{ search, status }}
          featuredAd={initialFeaturedAd}
        />
      </div>
    </FilterSidebarProvider>
  );
}
