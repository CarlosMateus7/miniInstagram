"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const PostUploader = dynamic(() => import("@/components/PostUploader"), {
  ssr: false,
});

export default function UploadPageClient() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  if (!id) return <p>ID não encontrado</p>;

  return (
    <div>
      <h1>Upload de Post</h1>
      <PostUploader userId={id} />
    </div>
  );
}
