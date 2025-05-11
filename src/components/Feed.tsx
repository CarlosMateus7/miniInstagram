"use client";

import { useEffect, useState } from "react";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: any;
  userId: string;
  userName?: string;
  likes: string[];
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setUserName(user.displayName || "Usuário");
      }
    });

    return () => unsubscribe();
  }, []);

  // Carrega os posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Post),
      }));
      setPosts(updatedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Carrega todos os comentários ao montar o feed
  useEffect(() => {
    const fetchAllComments = async () => {
      const q = query(collection(db, "comments"));
      const snapshot = await getDocs(q);
      const allComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Comment),
      }));
      setComments(allComments);
    };

    fetchAllComments();
  }, []);

  const handleCommentSubmit = async (postId: string) => {
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        postId,
        userId: currentUserId,
        userName,
        text: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment("");

      // Recarregar comentários após envio
      const q = query(collection(db, "comments"));
      const snapshot = await getDocs(q);
      const allComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Comment),
      }));
      setComments(allComments);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    const postRef = doc(db, "posts", postId);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
      });
    } catch (error) {
      console.error("Erro ao atualizar likes:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    try {
      await deleteDoc(doc(db, "posts", selectedPostId));
      setShowDeleteModal(false);
      setSelectedPostId(null);
    } catch (error) {
      console.error("Erro ao excluir post:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      {/* Botão Novo Post */}
      <div className="flex justify-end mb-4">
        {/* <Link href="/upload">
          <Button variant="outline">Novo Post</Button>
        </Link> */}
        {currentUserId && (
          <Button
            variant="secondary"
            onClick={() => router.push(`/profile/${currentUserId}`)}
          >
            Meu Perfil
          </Button>
        )}
      </div>

      {/* Modal de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold">Excluir Post</h2>
            <p>Tem certeza que deseja excluir este post?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeletePost}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading
        ? [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-[300px] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))
        : posts.map((post) => {
            const postComments = comments
              .filter((comment) => comment.postId === post.id)
              .sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);

            return (
              <Card key={post.id}>
                <CardContent className="p-4 space-y-2">
                  {/* Cabeçalho do post */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {post.userName ?? post.userId}
                    </span>
                    {post.userId === currentUserId && (
                      <button
                        onClick={() => {
                          setSelectedPostId(post.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-xl px-2 hover:text-red-500"
                        aria-label="Mais opções"
                      >
                        ...
                      </button>
                    )}
                  </div>

                  {/* Imagem */}
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={post.imageUrl}
                      alt="Post"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  {/* Legenda */}
                  <p className="text-sm text-gray-700">{post.caption}</p>

                  {/* Likes */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {post.likes?.length} likes •{" "}
                      {post.userName ?? post.userId}
                    </span>
                    <Button
                      size="sm"
                      variant={
                        post.likes?.includes(currentUserId)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleLikeToggle(
                          post.id,
                          post.likes?.includes(currentUserId)
                        )
                      }
                    >
                      {post.likes?.includes(currentUserId)
                        ? "Descurtir"
                        : "Curtir"}
                    </Button>
                  </div>

                  {/* Comentários */}
                  <div className="mt-4 space-y-1">
                    {postComments.map((comment) => (
                      <div key={comment.id} className="p-2 text-sm">
                        <strong>{comment.userName}:</strong> {comment.text}
                      </div>
                    ))}
                  </div>

                  {/* Campo de novo comentário */}
                  <div className="mt-2">
                    <textarea
                      className="w-full p-2 border rounded-md"
                      placeholder="Escreva um comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => handleCommentSubmit(post.id)}
                    >
                      Comentar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
    </div>
  );
}
