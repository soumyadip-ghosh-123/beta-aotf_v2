"use client";

import React from "react";
import TuitionPostForm from "@/components/admin/postforms/tuitionPostForm";

export default function EditTuitionPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = React.use(params);

  return <TuitionPostForm mode="edit" postId={postId} />;
}
