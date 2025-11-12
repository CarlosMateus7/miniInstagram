"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
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
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import PostModal from "./PostModal";
import { Comment, Post } from "@/app/types";
import DeleteModal from "./DeleteModal";
import PostOptionModal from "./PostOptionModal";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>(
    {}
  );
  const [userName, setUserName] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>(
    []
  );
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  // const [modalPost, setModalPost] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setUserName(user.displayName || "Utilizador");
      }
    });

    return () => unsubscribe();
  }, []);

  function openModal(post: Post) {
    setSelectedPost(post);
    // filtra os comentários do post selecionado
    const postComments = comments.filter(
      (comment) => comment.postId === post.id
    );
    setSelectedPostComments(postComments);
    setIsModalOpen(true);
  }

  // Load Posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPosts = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Post, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });
      setPosts(updatedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Comments
  useEffect(() => {
    const fetchAllComments = async () => {
      const q = query(collection(db, "comments"));
      const snapshot = await getDocs(q);
      const allComments = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Comment, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });
      setComments(allComments);
    };

    fetchAllComments();
  }, []);

  const handleCommentSubmit = async (postId: string) => {
    const commentText = newComments[postId];
    if (!commentText?.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        postId,
        userId: currentUserId,
        userName,
        text: commentText,
        userAvatar: auth.currentUser?.photoURL || "/default-avatar.png",
        createdAt: serverTimestamp(),
      });

      setNewComments((prev) => ({ ...prev, [postId]: "" }));

      // Reload comments
      const q = query(collection(db, "comments"));
      const snapshot = await getDocs(q);
      const allComments = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Comment, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });
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
    <>
      <div className="grid grid-cols-12 gap-6 mt-10 px-4">
        <div className="col-span-3">
          <div className="w-full flex items-center justify-start px-4 py-4">
            <Link href="/feed">
              <Image
                src="/mini-instagram-logo.png"
                alt="Mini Instagram"
                width={90}
                height={90}
                className="cursor-pointer"
              />
            </Link>
          </div>
        </div>
        <div className="col-span-6 space-y-6 mt-[95px]">
          {/* Delete Post Modal */}
          {showDeleteModal && (
            <DeleteModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDeletePost}
            />
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
                  <Card key={post.id} className="pb-[16px] mb-[20px]">
                    <CardContent className="p-4 space-y-2">
                      {/* Post Header */}
                      <div className="flex justify-between items-center pb-[12px] pl-[14px] pr-[10px]">
                        <span className="text-sm font-medium">
                          <div
                            onClick={() =>
                              router.push(`/profile/${currentUserId}`)
                            }
                            className="flex items-center gap-[10px]  cursor-pointer hover:opacity-80"
                          >
                            <Image
                              src={
                                auth.currentUser?.photoURL ||
                                "/default-avatar.png"
                              }
                              alt="Avatar"
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                            <span className="text-sm font-medium">
                              {post.userName ?? post.userId}
                            </span>
                          </div>
                        </span>
                        {post.userId === currentUserId && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPostId(post.id);
                                setShowOptionsModal(true);
                              }}
                              className="text-2xl px-2 text-gray-500 hover:text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                              aria-label="Mais opções"
                            >
                              <MoreHorizontal size={24} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Photo */}
                      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
                        {/* <Image
                          src={post.imageUrl}
                          alt="Post"
                          fill
                          className="object-cover !rounded-2xl"
                          style={{ borderRadius: "6px" }}
                        /> */}
                      </div>

                      <div className="flex flex-col pl-[12px] pr-[12px]">
                        {/* Likes */}
                        <div className="flex flex-col items-start gap-y-1 mt-[4px] mb-[4px]">
                          {/* Heart + MessageCircle lado a lado */}
                          <div className="flex items-center gap-x-2">
                            <button
                              onClick={() =>
                                handleLikeToggle(
                                  post.id,
                                  post.likes?.includes(currentUserId)
                                )
                              }
                              className="p-0 m-0 border-none bg-transparent transition-transform duration-200 hover:scale-110 cursor-pointer"
                              style={{ appearance: "none" }}
                              aria-label="Gostar"
                            >
                              <Heart
                                className={`w-5 h-5 transition-colors ${
                                  post.likes?.includes(currentUserId)
                                    ? "text-red-500 fill-red-500"
                                    : "text-muted-foreground"
                                }`}
                                fill={
                                  post.likes?.includes(currentUserId)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>

                            <button
                              onClick={() => openModal(post)}
                              className="p-0 m-0 border-none bg-transparent hover:opacity-80 transition"
                              style={{ appearance: "none" }}
                              aria-label="Ver comentários"
                            >
                              <MessageCircle className="w-5 h-5 text-muted-foreground transition-transform duration-200 hover:scale-110 cursor-pointer" />
                            </button>
                          </div>

                          {/* Contador por baixo dos ícones */}
                          <span className="text-[14px]">
                            {post.likes?.length > 0 &&
                              `${post.likes.length} ${
                                post.likes.length === 1 ? "gosto" : "gostos"
                              }`}
                          </span>
                        </div>

                        {/* Caption */}
                        <p className="text-sm text-gray-700 mt-[8px] mb-[8px]">
                          <strong
                            onClick={() =>
                              router.push(`/profile/${currentUserId}`)
                            }
                            className="cursor-pointer "
                          >
                            {post.userName ?? post.userId}
                          </strong>{" "}
                          {post.caption}
                        </p>

                        {postComments.length > 0 && (
                          <button
                            onClick={() => openModal(post)}
                            className="text-xs text-gray-500 hover:text-blue-600  mb-2 text-left bg-transparent border-none p-0 m-0 cursor-pointer"
                            style={{
                              appearance: "none",
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            {postComments.length === 1
                              ? "Ver 1 comentário"
                              : `Ver todos os ${postComments.length} comentários`}
                          </button>
                        )}

                        {/* Comments */}
                        {/* <div className="mt-4 space-y-1 mt-[8px]">
                        {postComments.map((comment) => (
                          <div key={comment.id} className="p-2 text-sm">
                            <strong>{comment.userName}:</strong> {comment.text}
                          </div>
                        ))}
                      </div> */}

                        {/* New Comment Field */}
                        <div className="mt-[8px] flex items-center gap-2">
                          <textarea
                            className="w-full border-none focus:border-none focus:ring-0 outline-none resize-none text-sm placeholder-gray-400"
                            placeholder="Adicionar comentário..."
                            value={newComments[post.id] || ""}
                            onChange={(e) =>
                              setNewComments((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            rows={1}
                          />
                          {newComments[post.id]?.trim() && (
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              className="text-sm text-blue-600 font-medium bg-transparent border-none p-0 m-0 cursor-pointer hover:underline"
                              style={{ appearance: "none" }}
                            >
                              Publicar
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="col-span-3 flex justify-center items-start pt-2">
          {currentUserId && (
            <div
              onClick={() => router.push(`/profile/${currentUserId}`)}
              className="flex items-center gap-[10px] mt-[45px] cursor-pointer hover:opacity-80"
            >
              <Image
                src={auth.currentUser?.photoURL || "/default-avatar.png"}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="text-sm font-medium">
                {auth.currentUser?.displayName || "Utilizador"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Só mostra o modal do post clicado */}
      {showOptionsModal && selectedPostId && (
        <PostOptionModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onEdit={() => {
            console.log("Editar post", selectedPostId);
            setShowOptionsModal(false);
          }}
          onDelete={() => {
            setShowDeleteModal(true);
            setShowOptionsModal(false);
          }}
          onCopyLink={() => {
            setShowOptionsModal(false);
            const postUrl = `${window.location.origin}/post/${selectedPostId}`;
            navigator.clipboard.writeText(postUrl);
          }}
        />
      )}

      {isModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
          comments={selectedPostComments}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          newComments={newComments}
          setNewComments={setNewComments}
          handleCommentSubmit={handleCommentSubmit}
        />
      )}
    </>
  );
}
