"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Post, Comment } from "@/app/types";
import ClientPostModalWrapper from "@/app/post/[id]/ClientPostModalWrapper";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    async function fetchPostData() {
      if (!id || Array.isArray(id)) return;

      // fetch post
      const postDoc = await getDoc(doc(db, "posts", id));
      if (postDoc.exists()) {
        setPost({ ...(postDoc.data() as Post), id });
      }

      // fetch comments
      const q = query(collection(db, "comments"), where("postId", "==", id));
      const snapshot = await getDocs(q);
      setComments(snapshot.docs.map((doc) => doc.data() as Comment));
    }

    fetchPostData();
  }, [id]);

  if (!post) return null;

  return (
    <main className="min-h-screen">
      <ClientPostModalWrapper post={post} comments={comments} />
    </main>
  );
}
