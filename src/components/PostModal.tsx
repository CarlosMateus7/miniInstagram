import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Comment, Post } from "@/app/types";
import PostActions from "./PostActions";
import CommentInput from "./CommentInput";
import PostOptionModal from "./PostOptionModal";
import DeleteModal from "./DeleteModal";
import {
  doc,
  deleteDoc,
  getDoc,
  Timestamp,
  collection,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PostModalProps {
  post: Post;
  comments: Comment[];
  currentUserId: string | null;
  isOpen: boolean;
  onClose: () => void;
  newComments: Record<string, string>;
  setNewComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onDeletePost?: (postId: string) => void;
}

export default function PostModal({
  currentUserId,
  post,
  comments,
  isOpen,
  onClose,
  newComments,
  setNewComments,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  onDeletePost,
}: PostModalProps) {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState("/default-avatar.png");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [localPost, setLocalPost] = useState<Post>(post);

  useEffect(() => {
    setLocalPost(post);
    setLocalComments(comments);
  }, [post, comments]);

  const handleCommentSubmit = async (postId: string) => {
    const text = newComments[postId];
    if (!text || !currentUserId) return;

    try {
      const commentRef = doc(collection(db, "comments"));
      const newComment = {
        id: commentRef.id,
        postId,
        userId: currentUserId,
        userName: post.userName,
        text,
        createdAt: Timestamp.fromDate(new Date()),
      };

      await setDoc(commentRef, newComment);

      setLocalComments((prev) => [...prev, newComment]);

      setNewComments((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
    }
  };

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleDeletePost = async () => {
    try {
      if (onDeletePost) {
        onDeletePost(post.id);
      } else {
        await deleteDoc(doc(db, "posts", post.id));
      }
      setShowDeleteModal(false);
      setShowOptionsModal(false);
      onClose();
    } catch (error) {
      console.error("Erro ao excluir post:", error);
    }
  };

  if (!isOpen) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    async function fetchAuthor() {
      try {
        const userDoc = await getDoc(doc(db, "users", post.userId));
        if (userDoc.exists()) {
          setAuthorAvatar(userDoc.data().photoURL || "/default-avatar.png");
        }
      } catch (err) {
        console.error("Erro ao buscar avatar:", err);
      }
    }

    fetchAuthor();
  }, [post.userId]);

  function getDateFromFirestore(
    value: Timestamp | Date | string | number
  ): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    } else if (value instanceof Date) {
      return value;
    } else {
      return new Date(value);
    }
  }

  const postDate = getDateFromFirestore(post.createdAt);

  const formattedDate = postDate.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[99998] flex justify-center items-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Fechar modal"
        className="absolute top-4 right-4 text-white hover:text-gray-800 z-10"
      >
        <X size={24} />
      </button>
      {/* Botão Previous */}
      {hasPrevious && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-[calc(10vw-3rem)] top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
          aria-label="Post anterior"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {/* Botão Next */}
      {hasNext && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-[calc(10vw-3rem)] top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
          aria-label="Próximo post"
        >
          <ChevronRight size={24} />
        </button>
      )}
      <div
        className="bg-white rounded-lg flex w-[80vw] h-[90vh] max-h-screen overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagem do post */}
        <div className="w-1/2 bg-black relative">
          <Image
            src={post.imageUrl}
            alt="Post"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-contain"
            priority
          />
        </div>

        {/* Área de detalhes à direita */}
        <div className="w-1/2 p-4 flex flex-col overflow-y-auto">
          {/* Autor */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Image
                src={authorAvatar}
                alt={post.userName}
                width={40}
                height={40}
                className="rounded-full object-cover h-10 mr-3"
              />
              <span className="font-medium">{post.userName}</span>
            </div>
            {post.userId === currentUserId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsModal(true);
                }}
                className="text-gray-500 hover:text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                aria-label="Mais opções"
              >
                <MoreHorizontal size={24} />
              </button>
            )}
          </div>

          {post.caption && (
            <>
              <hr className="my-2 border-gray-300" />
              {/* Descrição do post */}
              <p className="text-sm text-gray-700 mb-4">
                <strong>{post.userName}</strong>: {post.caption}
              </p>
            </>
          )}

          <hr className="my-2 border-gray-300" />
          {/* Comentários */}
          <div className="flex-grow overflow-y-auto pr-1 mb-4">
            {localComments.length > 0 ? (
              localComments.map((comment, index) => (
                <div
                  key={comment.id ?? `comment-${index}`}
                  className="mb-2 text-sm"
                >
                  <strong>{comment.userName}:</strong> {comment.text}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Sem comentários</p>
            )}
          </div>

          <PostActions
            post={localPost}
            currentUserId={currentUserId}
            onLikeToggle={(updatedLikes) => {
              setLocalPost((prev) => ({ ...prev, likes: updatedLikes }));
            }}
          />

          <p className="text-[12px] text-gray-500 italic mt-1 mb-3">
            {formattedDate}
          </p>

          {/* Campo de novo comentário */}
          <CommentInput
            postId={post.id}
            value={newComments[post.id] || ""}
            onChange={(text) =>
              setNewComments((prev) => ({
                ...prev,
                [post.id]: text,
              }))
            }
            onSubmit={() => handleCommentSubmit(post.id)}
          />
        </div>
      </div>

      {/* Modais de opções e delete */}
      {showOptionsModal && (
        <PostOptionModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onEdit={() => {
            console.log("Editar post", post.id);
            setShowOptionsModal(false);
          }}
          onDelete={() => {
            setShowDeleteModal(true);
            setShowOptionsModal(false);
          }}
          onCopyLink={() => {
            setShowOptionsModal(false);
            const postUrl = `${window.location.origin}/post/${post.id}`;
            navigator.clipboard.writeText(postUrl);
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePost}
        />
      )}
    </div>
  );
}
