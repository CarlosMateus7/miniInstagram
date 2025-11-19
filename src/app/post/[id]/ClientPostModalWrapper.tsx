"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostModal from "@/components/PostModal";
import { Post, Comment } from "@/app/types";

interface Props {
  post: Post;
  comments: Comment[];
}

export default function ClientPostModalWrapper({ post, comments }: Props) {
  const router = useRouter();

  const [newComments, setNewComments] = useState({});
  const currentUserId = post.userId;

  return (
    <PostModal
      post={post}
      comments={comments}
      currentUserId={currentUserId}
      isOpen={true}
      newComments={newComments}
      setNewComments={setNewComments}
      handleCommentSubmit={() => {}}
      onClose={() => router.push("/feed")}
    />
  );
}
