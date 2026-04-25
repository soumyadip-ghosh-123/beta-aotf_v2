import Search from "@/components/Search";
import JobPost from "@/components/PostCards/JobPost";
import { FilterSidebarProvider } from "@/components/filter-sidebar-context";
import {
  getApplicantCountsByJobIds,
} from "@/lib/services/application.service";
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

  const { jobs, pagination } = await listJobs({
    page,
    limit: 20,
    search,
    status,
  });

  const jobIds = jobs.map((job) => job.jobId);
  const applicantCountsMap = await getApplicantCountsByJobIds(jobIds);

  return (
    <FilterSidebarProvider>
      <div className="flex flex-col items-center justify-center w-full px-2 mb-16">
        <Search />

        {jobs.length === 0 ? (
          <p className="text-default-500 mt-10">No jobs found</p>
        ) : (
          <div className="w-full max-w-md mt-6 space-y-4">
            {jobs.map((job) => (
              <JobPost
                key={job.jobId}
                jobId={job.jobId}
                clientName={job.clientName}
                companyType={job.companyType}
                title={job.title}
                workType={job.workType}
                experience={job.experience}
                locationType={job.locationType}
                location={job.location}
                gender={job.gender}
                timing={job.timing}
                salary={job.salary}
                requiredQualification={job.requiredQualification}
                projectType={job.projectType}
                budget={job.budget}
                duration={job.duration}
                brief={job.brief}
                status={job.status}
                createdAt={job.createdAt?.toISOString()}
                createdByUserId={{
                  name: job.author?.name,
                  avatar: job.author?.avatarUrl,
                }}
                initialApplied={false}
                applicantCount={applicantCountsMap.get(job.jobId) ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </FilterSidebarProvider>
  );
}
