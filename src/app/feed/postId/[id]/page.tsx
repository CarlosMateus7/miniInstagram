"use client";

import { useParams } from "next/navigation";
import ClientPostModalWrapper from "../../../post/[id]/ClientPostModalWrapper";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post, Comment } from "@/app/types";

export default function PostPage() {
  const { id } = useParams(); // este é o id do post
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    async function fetchPostData() {
      if (!id) return;

      if (!id || Array.isArray(id)) return;

      const postDoc = await getDoc(doc(db, "posts", id));
      if (postDoc.exists()) {
        setPost(postDoc.data() as Post);
      }

      // Buscar comentários
      const q = query(collection(db, "comments"), where("postId", "==", id));
      const snapshot = await getDocs(q);
      const commentsData = snapshot.docs.map((doc) => doc.data() as Comment);
      setComments(commentsData);
    }

    fetchPostData();
  }, [id]);

  return (
    <main className="min-h-screen p-4">
      {post ? (
        <ClientPostModalWrapper post={post} comments={comments} />
      ) : (
        <></>
      )}
    </main>
  );
}
