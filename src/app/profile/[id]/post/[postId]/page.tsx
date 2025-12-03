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
import ProfilePostModalWrapper from "./ProfilePostModalWrapper";

export default function PostPage() {
  const { id, postId } = useParams();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPostData() {
      if (!postId || Array.isArray(postId)) return;

      // fetch post
      const postDoc = await getDoc(doc(db, "posts", postId));
      if (postDoc.exists()) {
        setPost({ ...(postDoc.data() as Post), id: postId });
      }

      // fetch comments
      const qComments = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );
      const snapshot = await getDocs(qComments);
      setComments(
        snapshot.docs.map((d) => ({ ...(d.data() as Comment), id: d.id }))
      );

      // fetch ALL posts from user
      const qPosts = query(collection(db, "posts"), where("userId", "==", id));

      const snapPosts = await getDocs(qPosts);
      const orderedPosts = snapPosts.docs
        .map((doc) => ({ ...(doc.data() as Post), id: doc.id }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setUserPosts(orderedPosts);
    }

    fetchPostData();
  }, [postId]);

  if (!post) return null;
  if (!id || Array.isArray(id)) return null;

  return (
    <main className="min-h-screen">
      <ProfilePostModalWrapper
        post={post}
        comments={comments}
        userId={id}
        userPosts={userPosts}
      />
    </main>
  );
}
