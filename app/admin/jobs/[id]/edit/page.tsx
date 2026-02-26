"use client";

import React from "react";
import JobPostForm from "@/components/admin/postforms/jobPostForm";

export default function EditJobPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = React.use(params);

  return <JobPostForm mode="edit" postId={postId} />;
}
