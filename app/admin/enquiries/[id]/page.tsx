"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";
import JobPostForm from "@/components/admin/postforms/jobPostForm";
import TuitionPostForm from "@/components/admin/postforms/tuitionPostForm";
import { Enquiry } from "@/components/admin/enquiries/EnquiryCard";

interface EnquiryFormPageProps {
  params: Promise<{ id: string }>;
}

export default function EnquiryFormPage({ params }: EnquiryFormPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enquiryId, setEnquiryId] = useState<string>("");
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const type = searchParams.get("type") as "job" | "tuition" | null;

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setEnquiryId(resolvedParams.id);
    };
    loadParams();
  }, [params]);
  useEffect(() => {
    if (!enquiryId) return;

    // Simulate fetching enquiry data (mock data for now)
    const fetchEnquiry = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock enquiry data based on ID
        const mockEnquiry: Enquiry = {
          _id: enquiryId,
          enquiryId: `ENQ-${enquiryId.slice(-8).toUpperCase()}`,
          name: "John Doe",
          phoneNumber: "9876543210",
          query: "I am looking for a suitable job opportunity in Mumbai area. I have 5 years of experience in software development.",
          currentStatus: "new",
          lastActionByAdminName: null,
          lastActionByAdminRole: null,
          lastAttemptNumber: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setEnquiry(mockEnquiry);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [enquiryId]);

  // Redirect if no type is specified
  useEffect(() => {
    if (!type && !loading) {
      router.push("/admin/enquiries");
    }
  }, [type, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="light"
            startContent={<ArrowLeft size={18} />}
            onPress={() => router.push("/admin/enquiries")}
            className="mb-4"
          >
            Back to Enquiries
          </Button>
          <div className="text-center py-20 text-danger">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!type) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header with Back Button and Enquiry Info */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-divider">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="light"
              startContent={<ArrowLeft size={18} />}
              onPress={() => router.push("/admin/enquiries")}
            >
              Back to Enquiries
            </Button>
            {enquiry && (
              <div className="text-right">
                <p className="text-xs text-default-500">Enquiry ID</p>
                <p className="text-sm font-semibold">{enquiry.enquiryId}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enquiry Details Card */}
      {enquiry && (
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-default-100 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Enquiry Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-default-500">Name:</span>
                <span className="ml-2 font-medium">{enquiry.name}</span>
              </div>
              <div>
                <span className="text-default-500">Phone:</span>
                <span className="ml-2 font-medium">{enquiry.phoneNumber}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-default-500">Query:</span>
                <p className="mt-1 text-default-700">{enquiry.query}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Component */}
      <div className="pb-8">
        {type === "job" ? (
          <JobPostForm enquiry={enquiry} />
        ) : type === "tuition" ? (
          <TuitionPostForm enquiry={enquiry} />
        ) : null}
      </div>
    </div>
  );
}