"use client";

import dynamic from "next/dynamic";

// Importação dinâmica para garantir que o componente seja carregado apenas no cliente
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
