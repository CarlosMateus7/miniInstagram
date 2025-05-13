"use client";

import dynamic from "next/dynamic";

const PostUploader = dynamic(() => import("@/components/PostUploader"), {
  ssr: false,
});

export default function UploadPageClient() {
  return (
    <div>
      <h1>Upload de Post</h1>
      <PostUploader />
    </div>
  );
}
