"use client";

import { Heart, MessageCircle } from "lucide-react";

import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/app/types";

interface PostActionsProps {
  post: Post;
  currentUserId: string;
  openModal?: (post: Post) => void;
}

export default function PostActions({
  post,
  currentUserId,
  openModal,
}: PostActionsProps) {
  const liked = post.likes?.includes(currentUserId);

  const handleLikeToggle = async (
    postId: string,
    isLiked: boolean | undefined
  ) => {
    const postRef = doc(db, "posts", postId);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
      });
    } catch (error) {
      console.error("Erro ao atualizar likes:", error);
    }
  };

  return (
    <div className="flex flex-col items-start gap-y-1 mt-[4px] mb-[4px]">
      {/* Heart + MessageCircle lado a lado */}
      <div className="flex items-center gap-x-2">
        <button
          onClick={() => handleLikeToggle(post.id, liked)}
          className="p-0 m-0 border-none bg-transparent transition-transform duration-200 hover:scale-110 cursor-pointer"
          style={{ appearance: "none" }}
          aria-label="Gostar"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              liked ? "text-red-500 fill-red-500" : "text-muted-foreground"
            }`}
            fill={liked ? "currentColor" : "none"}
          />
        </button>

        <button
          onClick={() => openModal?.(post)}
          className="p-0 m-0 border-none bg-transparent hover:opacity-80 transition"
          style={{ appearance: "none" }}
          aria-label="Comentários"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground transition-transform duration-200 hover:scale-110 cursor-pointer" />
        </button>
      </div>

      {/* Contador por baixo dos ícones */}
      <span className="text-[14px]">
        {post.likes.length > 0 &&
          `${post.likes.length} ${
            post.likes.length === 1 ? "gosto" : "gostos"
          }`}
      </span>
    </div>
  );
}
