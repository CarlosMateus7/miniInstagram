"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Post } from "@/app/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePost: (updatedPost: Post) => void;
}

export default function EditPostModal({
  post,
  isOpen,
  onClose,
  onUpdatePost,
}: EditPostModalProps) {
  const [localPostState, setLocalPostState] = useState<Post>(post);

  // Sincroniza quando o post muda
  useEffect(() => {
    setLocalPostState(post);
  }, [post]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      // Atualiza no Firestore
      await updateDoc(doc(db, "posts", post.id), {
        caption: localPostState.caption,
        // aqui você poderia atualizar outros campos se necessário
      });

      // Atualiza localmente no PostModal
      onUpdatePost(localPostState);

      onClose();
    } catch (err) {
      console.error("Erro ao salvar post:", err);
    }
  };

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
      <div
        className="bg-white rounded-lg flex w-[80vw] h-[90vh] max-h-screen overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between p-4 border-b border-gray-300 bg-white z-10">
          <button className="text-blue-500 font-medium" onClick={onClose}>
            Cancelar
          </button>
          <h2 className="font-semibold text-lg">Editar Post</h2>
          <button className="text-blue-500 font-medium" onClick={handleSave}>
            Concluído
          </button>
        </div>

        {/* Coluna da imagem */}
        <div className="w-1/2 bg-black relative">
          <Image
            src={localPostState.imageUrl || "/default-post.png"}
            alt="Post"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-contain"
          />
        </div>

        {/* Coluna de detalhes */}
        <div className="w-1/2 flex flex-col overflow-y-auto pt-16 p-4">
          <textarea
            value={localPostState.caption}
            onChange={(e) =>
              setLocalPostState({ ...localPostState, caption: e.target.value })
            }
            placeholder="Escreva uma descrição..."
            className="w-full h-full border rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
