import React from "react";
import { Button } from "../button";
import { DeleteModalProps } from "@/types/ui";

export default function DeleteModal({
  onClose,
  onConfirm,
  pendingDeleteId = null,
  deletingIds = [],
}: DeleteModalProps) {
  const isDeleting = pendingDeleteId ? deletingIds.includes(pendingDeleteId) : false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-background/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-primary text-lg font-medium mb-2">Supprimer l'habitude</h3>
        <p className="text-sm text-foreground mb-4">
          Voulez-vous vraiment supprimer cette habitude ? Cette action est irréversible.
        </p>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="primaryOutline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}