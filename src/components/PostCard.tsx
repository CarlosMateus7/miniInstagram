// components/PostCard.tsx
"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Comment, Post } from "@/app/types";
import PostActions from "./PostActions";
import CommentInput from "./CommentInput";
import { Card, CardContent } from "@/components/ui/card";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  postComments: Comment[];
  newComments: Record<string, string>;
  setNewComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleCommentSubmit: (postId: string) => void;
  openModal?: (post: Post) => void;
  setSelectedPostIdForOptions?: (postId: string) => void;
  setShowOptionsModal?: (show: boolean) => void;
}

export default function PostCard({
  post,
  currentUserId,
  postComments,
  newComments,
  setNewComments,
  handleCommentSubmit,
  openModal,
  setSelectedPostIdForOptions,
  setShowOptionsModal,
}: PostCardProps) {
  const router = useRouter();

  return (
    <Card key={post.id} className="pb-[16px] mb-[20px]">
      <CardContent className="p-4 space-y-2">
        {/* Post Header */}
        <div className="flex justify-between items-center pb-[12px] pl-[14px] pr-[10px]">
          <div
            onClick={() => router.push(`/profile/${currentUserId}`)}
            className="flex items-center gap-[10px] cursor-pointer hover:opacity-80"
          >
            <Image
              src={auth.currentUser?.photoURL || "/default-avatar.png"}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="text-sm font-medium">
              {post.userName ?? post.userId}
            </span>
          </div>

          {post.userId === currentUserId &&
            setSelectedPostIdForOptions &&
            setShowOptionsModal && (
              <button
                onClick={() => {
                  setSelectedPostIdForOptions(post.id);
                  setShowOptionsModal(true);
                }}
                className="text-2xl px-2 text-gray-500 hover:text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                aria-label="Mais opções"
              >
                <MoreHorizontal size={24} />
              </button>
            )}
        </div>

        {/* Photo */}
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
          <Image
            src={post.imageUrl}
            alt="Post"
            fill
            className="object-cover !rounded-2xl"
            style={{ borderRadius: "6px" }}
          />
        </div>

        <div className="flex flex-col pl-[12px] pr-[12px]">
          {/* Likes + Comentários */}
          <PostActions
            post={post}
            currentUserId={currentUserId}
            openModal={openModal}
          />

          {/* Caption */}
          <p className="text-sm text-gray-700 mt-[8px] mb-[8px]">
            <strong
              onClick={() => router.push(`/profile/${currentUserId}`)}
              className="cursor-pointer"
            >
              {post.userName ?? post.userId}
            </strong>{" "}
            {post.caption}
          </p>

          {/* Ver comentários */}
          {postComments.length > 0 && openModal && (
            <button
              onClick={() => openModal(post)}
              className="text-xs text-gray-500 hover:text-blue-600 mb-2 text-left bg-transparent border-none p-0 m-0 cursor-pointer"
              style={{ appearance: "none" }}
            >
              {postComments.length === 1
                ? "Ver 1 comentário"
                : `Ver todos os ${postComments.length} comentários`}
            </button>
          )}

          {/* New Comment Field */}
          <CommentInput
            postId={post.id}
            value={newComments[post.id] || ""}
            onChange={(text) =>
              setNewComments((prev) => ({
                ...prev,
                [post.id]: text,
              }))
            }
            onSubmit={handleCommentSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
