"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BlockedUserModalProps } from "@/types/ui";

export default function BlockedUserModal({ isOpen, onClose }: BlockedUserModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md mx-4 bg-background rounded-md p-6 shadow-lg z-50">
        <h3 className="text-lg font-semibold mb-2 text-destructive">Compte bloqué</h3>
        <p className="text-sm text-foreground mb-4">
          Votre compte a été bloqué par un administrateur. Vous ne pouvez pas vous connecter pour le moment.
        </p>
        <p className="text-sm text-foreground mb-4">
          Veuillez contacter un administrateur pour plus d'informations.
        </p>
        <div className="flex justify-center">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}
