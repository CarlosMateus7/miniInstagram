"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogOverlay className="fixed inset-0 bg-black/50 z-[99998]" />
      <DialogContent className="max-w-sm  p-6 w-[40%] rounded-md shadow-lg bg-white space-y-4 z-[99999] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Excluir Post</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este post?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            className="hover:bg-red-500"
          >
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
