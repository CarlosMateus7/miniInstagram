"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PostModal from "@/components/PostModal";
import { Post, Comment } from "@/app/types";

interface Props {
  post: Post;
  comments: Comment[];
  userId: string;
  userPosts: Post[];
}

export default function ProfilePostModalWrapper({
  post,
  comments,
  userId,
  userPosts,
}: Props) {
  const router = useRouter();

  const [newComments, setNewComments] = useState({});
  const currentUserId = post.userId;

  // index do post atual
  const currentIndex = useMemo(
    () => userPosts.findIndex((p) => p.id === post.id),
    [userPosts, post.id]
  );

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < userPosts.length - 1;

  const goPrevious = () => {
    const prevPost = userPosts[currentIndex - 1];
    router.push(`/profile/${userId}/post/${prevPost.id}`);
  };

  const goNext = () => {
    const nextPost = userPosts[currentIndex + 1];
    router.push(`/profile/${userId}/post/${nextPost.id}`);
  };

  return (
    <PostModal
      post={post}
      comments={comments}
      currentUserId={currentUserId}
      isOpen={true}
      newComments={newComments}
      setNewComments={setNewComments}
      onClose={() => router.push(`/profile/${userId}`)}
      onNext={hasNext ? goNext : undefined}
      onPrevious={hasPrevious ? goPrevious : undefined}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
    />
  );
}
