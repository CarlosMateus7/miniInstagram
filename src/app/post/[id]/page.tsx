import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import ClientPostModalWrapper from "./ClientPostModalWrapper";
import { Post, Comment } from "@/app/types";

export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = params.id;

  const postSnap = await getDoc(doc(db, "posts", postId));

  if (!postSnap.exists()) {
    return <div className="text-center mt-10">Post não encontrado.</div>;
  }

  console.log("entra aqui===");

  const postData = postSnap.data();

  const post: Post = {
    id: postSnap.id,
    imageUrl: postData.imageUrl,
    caption: postData.caption,
    userId: postData.userId,
    userName: postData.userName,
    createdAt: postData.createdAt,
    likes: postData.likes ?? [],
  };

  const commentsSnap = await getDocs(
    query(collection(db, "comments"), where("postId", "==", postId))
  );

  const comments: Comment[] = commentsSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Comment, "id">),
  }));

  return <ClientPostModalWrapper post={post} comments={comments} />;
}
