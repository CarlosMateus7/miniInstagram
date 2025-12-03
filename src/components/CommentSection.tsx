"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase-client";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Comment = {
  id: string;
  text: string;
  userId: string;
  displayName: string;
  createdAt: Timestamp;
};

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;

    const commentsRef = collection(db, "posts", postId, "comments");

    await addDoc(commentsRef, {
      text,
      userId: user.uid,
      displayName: user.displayName || "User",
      userAvatar: user.photoURL || "/default-avatar.png",
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="mt-4">
      <div className="space-y-2 mb-3">
        {comments.map((c) => (
          <div key={c.id} className="text-sm text-gray-800 border-b pb-1">
            <strong>{c.displayName}</strong>: {c.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={!text.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
