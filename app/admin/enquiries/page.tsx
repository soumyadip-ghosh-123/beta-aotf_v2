"use client";

import { useEffect, useState, useCallback } from "react";
import EnquiryCard, { Enquiry } from "@/components/admin/enquiries/EnquiryCard";
import { Spinner } from "@heroui/spinner";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/enquiry");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch");

      setEnquiries(data.enquiries);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-danger">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {enquiries.length === 0 ? (
        <p className="text-center text-default-500 py-10">No enquiries yet.</p>
      ) : (
        enquiries.map((enq) => (
          <EnquiryCard
            key={enq._id}
            enquiry={enq}
            onStatusUpdated={fetchEnquiries}
          />
        ))
      )}
    </div>
  );
}
