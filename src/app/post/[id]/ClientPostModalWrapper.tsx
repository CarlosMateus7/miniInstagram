"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import PostModal from "@/components/PostModal";
import { Post, Comment } from "@/app/types";

interface Props {
  post: Post;
  comments: Comment[];
}

export default function ClientPostModalWrapper({ post, comments }: Props) {
  const router = useRouter();

  const currentUserId = auth.currentUser?.uid ?? null;

  const [newComments, setNewComments] = useState({});

  return (
    <PostModal
      post={post}
      comments={comments}
      currentUserId={currentUserId}
      isOpen={true}
      newComments={newComments}
      setNewComments={setNewComments}
      onClose={() => router.push(`/feed`)}
    />
  );
}
