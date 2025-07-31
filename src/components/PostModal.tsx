import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Comment {
  id: string;
  userName: string;
  text: string;
}

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
}

interface PostModalProps {
  post: Post;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  newComments: Record<string, string>;
  setNewComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleCommentSubmit: (postId: string) => void;
}

export default function PostModal({
  post,
  comments,
  isOpen,
  onClose,
  newComments,
  setNewComments,
  handleCommentSubmit,
}: PostModalProps) {
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[99999] flex justify-center items-center"
      onClick={onClose} // clicar no backdrop fecha a modal
    >
      {/* Botão fechar fixo no canto superior direito da viewport */}
      <button
        onClick={onClose}
        aria-label="Fechar modal"
        className="fixed top-4 right-4 text-white z-[100000] hover:text-gray-300"
      >
        <X size={32} />
      </button>

      {/* Conteúdo da modal */}
      <div
        className="bg-white rounded-lg flex w-[80vw] h-[100vh] max-h-screen overflow-hidden"
        onClick={(e) => e.stopPropagation()} // previne fechar ao clicar dentro da modal
      >
        {/* Post - 2/3 do espaço */}
        <div className="w-2/3 relative bg-black flex flex-col">
          <div className="relative flex-grow">
            <Image
              src={post.imageUrl}
              alt="Post completo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="p-4 text-gray-700 bg-white">{post.caption}</p>
        </div>

        {/* Comentários - 1/3 do espaço */}
        <div className="w-1/3 flex flex-col border-l border-gray-300 p-4 bg-white">
          <div className="flex-grow overflow-y-auto pr-2">
            <h3 className="font-semibold mb-4">Comentários</h3>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="mb-3 text-sm">
                  <strong>{comment.userName}:</strong> {comment.text}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Sem comentários</p>
            )}
          </div>

          {/* Campo de novo comentário */}
          <div className="mt-4">
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Escreva um comentário..."
              value={newComments[post.id] || ""}
              onChange={(e) =>
                setNewComments((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
            />
            <button
              className="mt-2 px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
              onClick={() => handleCommentSubmit(post.id)}
            >
              Comentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
