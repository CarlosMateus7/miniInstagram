"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Comment, Post } from "@/app/types";
import { Separator } from "@radix-ui/react-separator";

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
  return (
    <>
      {/* ✅ Botão X totalmente fora do Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[1001] pointer-events-none">
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-6 right-6 text-white/80 hover:text-white transition pointer-events-auto"
          >
            <X size={30} />
          </button>
        </div>
      )}

      {/* <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tw:flex tw:p-6 tw:flex-col tw:gap-4 tw:rounded-lg tw:border tw:border-[#E4E4E7] tw:bg-white tw:shadow-lg tw:overflow-y-auto">
        <DialogHeader className="tw:w-full tw:items-start">
          <DialogTitle>{!note ? labels.noteModal.newNote() : labels.noteModal.editNote()}</DialogTitle>
          <p className="tw:text-sm tw:text-muted-foreground">
            {!note ? labels.noteModal.createMessage() : labels.noteModal.editMessage()}
          </p>
        </DialogHeader> */}

      {/* ✅ O Dialog em si */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Fundo cinzento translúcido */}
        {/* <DialogOverlay className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000]" /> */}

        {/* Conteúdo da modal */}
        <DialogContent
          className="flex w-[90vw] h-[80vh] p-0 overflow-hidden rounded-md bg-grey z-[1002] z-[99999]"
          aria-describedby="post-modal-description"
        >
          <DialogTitle></DialogTitle>

          {/* Imagem à esquerda */}
          <div className="w-1/2 relative bg-black">
            <Image
              src={post.imageUrl}
              alt="Post"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Área de detalhes à direita */}
          <div className="w-1/2 flex flex-col overflow-y-auto bg-gray-200 p-4 mx-[14px] rounded-lg">
            <DialogHeader className="flex flex-row items-center justify-between mb-4 mt-[14px]">
              <div className="flex items-center gap-[10px]">
                <Image
                  src={post.userAvatar}
                  alt={post.userName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover mr-2"
                />
                <span className="font-medium text-gray-900">
                  {post.userName}
                </span>
              </div>
            </DialogHeader>

            <hr className="my-[14px] border-t border-gray-300" />
            <Separator />

            {/* Descrição */}
            <p className="text-sm text-gray-800 mb-4">
              <strong>{post.userName}</strong>: {post.caption}
            </p>

            {/* Comentários */}
            <div className="flex-grow overflow-y-auto pr-1 mb-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="mb-2 text-sm text-gray-700">
                    <strong>{comment.userName}:</strong> {comment.text}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Sem comentários</p>
              )}
            </div>

            {/* Novo comentário */}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
