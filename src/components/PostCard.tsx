"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import CommentSection from "@/components/CommentSection";

type Post = {
  id: string;
  imageUrl: string;
  caption: string;
  likes: string[];
  userId: string;
};

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [hasLiked, setHasLiked] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!post.id) return;
    const unsubscribe = onSnapshot(doc(db, "posts", post.id), (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setLikes(data.likes || []);
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  useEffect(() => {
    if (!userId) return;
    setHasLiked(likes.includes(userId));
  }, [likes, userId]);

  const toggleLike = async () => {
    if (!userId) return;
    const postRef = doc(db, "posts", post.id);
    if (hasLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
      });
    }
  };

  return (
    <div className="border rounded-xl p-4 mb-4 shadow-sm">
      <img
        src={post.imageUrl}
        alt={post.caption}
        className="w-full rounded-lg mb-2"
      />
      <p className="text-sm text-gray-600 mb-2">{post.caption}</p>
      <Button
        onClick={toggleLike}
        variant="ghost"
        className={`flex items-center gap-1 ${
          hasLiked ? "text-red-500" : "text-gray-500"
        }`}
      >
        <Heart fill={hasLiked ? "red" : "none"} size={20} />
        <span>{likes.length}</span>
      </Button>
      <CommentSection postId={post.id} />
    </div>
  );
}
