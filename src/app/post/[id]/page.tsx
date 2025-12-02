"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Post, Comment } from "@/app/types";
import ClientPostModalWrapper from "./ClientPostModalWrapper";

export default function PostPage() {
  const { id: postId } = useParams();
  // const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  // const currentUserId = auth.currentUser?.uid ?? null;

  useEffect(() => {
    if (!postId || Array.isArray(postId)) return;

    const fetchData = async () => {
      // Fetch post
      const postSnap = await getDoc(doc(db, "posts", postId));
      if (!postSnap.exists()) {
        console.warn("Post not found");
        return;
      }
      const postData = postSnap.data();
      setPost({
        id: postSnap.id,
        imageUrl: postData.imageUrl,
        caption: postData.caption,
        userId: postData.userId,
        userName: postData.userName,
        createdAt: postData.createdAt,
        likes: postData.likes ?? [],
      });

      // Fetch comments
      const commentsSnap = await getDocs(
        query(collection(db, "comments"), where("postId", "==", postId))
      );
      const commentsData: Comment[] = commentsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Comment, "id">),
      }));
      setComments(commentsData);
    };

    fetchData();
  }, [postId]);

  if (!post) return <div className="text-center mt-10">Loading post...</div>;

  return <ClientPostModalWrapper post={post} comments={comments} />;
}
