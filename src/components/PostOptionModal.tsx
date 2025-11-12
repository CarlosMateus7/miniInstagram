"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";

interface PostActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

export default function PostActionModal({
  isOpen,
  onClose,
  onEdit,
  onCopyLink,
  onDelete,
}: PostActionModalProps) {
  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleCopyLink = () => {
    onCopyLink();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" />

      <DialogTitle />

      <DialogContent
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             w-[40%] max-w-sm z-[1001] animate-fade-in [&>button]:hidden"
      >
        <div className="bg-gray-500 rounded-2xl overflow-visible">
          <div className="flex flex-col divide-y divide-gray-700/30">
            <button
              onClick={handleEdit}
              className="block w-full h-16 text-center text-white hover:bg-white/10 cursor-pointer"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="block w-full h-16 text-center text-white hover:bg-white/10 cursor-pointer"
            >
              Apagar
            </button>
            <button
              onClick={handleCopyLink}
              className="block w-full h-16 text-center text-white hover:bg-white/10 cursor-pointer"
            >
              Copiar ligação
            </button>
            <button
              onClick={onClose}
              className="block w-full h-16 text-center text-white font-medium hover:bg-white/10 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
