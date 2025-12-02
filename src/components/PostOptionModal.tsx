"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
      <DialogTitle />
      <DialogContent
        aria-describedby={undefined}
        className="fixed 
                   w-[40%] max-w-sm z-[100010] animate-fade-in p-0 [&>button]:hidden bg-gray-500"
      >
        <div className="bg-gray-500 rounded-2xl overflow-visible text-black">
          <div className="flex flex-col divide-y divide-gray-700/30">
            <button
              onClick={handleDelete}
              className="block w-full h-12 text-center text-red-500 hover:bg-white/10 cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={handleEdit}
              className="block w-full h-12 text-center hover:bg-white/10 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={handleCopyLink}
              className="block w-full h-12 text-center hover:bg-white/10 cursor-pointer"
            >
              Copy Link
            </button>
            <button
              onClick={onClose}
              className="block w-full h-12 text-center font-medium hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
