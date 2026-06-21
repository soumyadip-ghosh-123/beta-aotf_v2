"use client";

import { reportClientError } from "@/lib/client-report-error";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { ArrowLeft, ArrowUpDown, User } from "lucide-react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import JobPostForm from "@/components/admin/postforms/jobPostForm";
import TuitionPostForm from "@/components/admin/postforms/tuitionPostForm";
import { Enquiry } from "@/components/admin/enquiries/EnquiryCard";
import { FaPhone } from "react-icons/fa";

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

  const formatPhone = (value?: string) => {
    if (!value) return "-";
    const digits = value.replace(/\D/g, "");
    if (!digits) return value;
    const parts: string[] = [];
    for (let i = 0; i < digits.length; i += 5) {
      parts.push(digits.slice(i, i + 5));
    }
    return parts.join(" ");
  };

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setEnquiryId(resolvedParams.id);
    };
    loadParams();
  }, [params]);
  useEffect(() => {
    if (!enquiryId) return;

    const fetchEnquiry = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/enquiry/${enquiryId}`);
        const contentType = res.headers.get("content-type") ?? "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await res.json() : null;

        if (!res.ok) {
          throw new Error(
            data?.error || `Failed to fetch enquiry (${res.status})`,
          );
        }

        if (!isJson || !data) {
          throw new Error("Unexpected server response while loading enquiry");
        }

        setEnquiry(data.enquiry as Enquiry);
      } catch (err: any) {
        reportClientError(err, { feature: "admin-enquiry-detail" });
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
    <div className="min-h-screen w-full">
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
          <Accordion variant="splitted" defaultExpandedKeys={[] as never}>
            <AccordionItem
              key="enquiry-details"
              aria-label="Enquiry details"
              title={
                <div className="flex sm:flex-row sm:items-center sm:justify-between items-center gap-3 w-full">
                  <span className="text-sm text-default-900 font-medium">
                    <User size={18} className="inline" />
                    {enquiry.name}
                  </span>
                  <span className="text-sm text-default-600 font-medium">
                    <FaPhone className="inline mr-2" />
                    {formatPhone(enquiry.phoneNumber)}
                  </span>
                </div>
              }
              subtitle="Tap to view enquiry query"
            >
              <div className="pt-2 space-y-2 text-sm">
                <div>
                  <span className="text-default-500">Enquiry ID:</span>
                  <span className="ml-2 font-medium">{enquiry.enquiryId}</span>
                  <br />
                  <span className="text-default-500">
                    Query: {enquiry.query}
                  </span>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
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
