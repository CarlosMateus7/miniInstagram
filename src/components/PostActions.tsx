"use client";

import { Heart, MessageCircle } from "lucide-react";

import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Post } from "@/app/types";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  post: Post;
  currentUserId: string;
  onLikeToggle?: (likes: string[]) => void;
}

export default function PostActions({
  post,
  currentUserId,
  onLikeToggle,
}: PostActionsProps) {
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const liked = likes.includes(currentUserId);
  const router = useRouter();

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    const postRef = doc(db, "posts", postId);

    const updatedLikes = isLiked
      ? likes.filter((id) => id !== currentUserId)
      : [...likes, currentUserId!];

    onLikeToggle?.(updatedLikes);

    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
      });
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleCommentsClick = () => {
    if (!post?.id) return;
    router.push(`/feed/postId/${post.id}`, { scroll: false });
  };

  return (
    <div className="flex flex-col items-start gap-y-1 mt-[4px] mb-[4px]">
      {/* Heart + MessageCircle side by side */}
      <div className="flex items-center gap-x-2">
        <button
          onClick={() => {
            handleLikeToggle(post.id, liked);
          }}
          className="p-0 m-0 border-none bg-transparent transition-transform duration-200 hover:scale-110 cursor-pointer"
          style={{ appearance: "none" }}
          aria-label="Like"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              liked ? "text-red-500 fill-red-500" : "text-muted-foreground"
            }`}
            fill={liked ? "currentColor" : "none"}
          />
        </button>

        <button
          onClick={handleCommentsClick}
          className="p-0 m-0 border-none bg-transparent hover:opacity-80 transition"
          style={{ appearance: "none" }}
          aria-label="Comments"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground transition-transform duration-200 hover:scale-110 cursor-pointer" />
        </button>
      </div>

      <span className="text-[14px]">
        {post.likes.length > 0 &&
          `${post.likes.length} ${post.likes.length === 1 ? "like" : "likes"}`}
      </span>
    </div>
  );
}
