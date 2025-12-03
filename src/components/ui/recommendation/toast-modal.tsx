import React from "react";
import { useRouter } from "next/navigation";
import { ToastModalProps } from "@/types/ui";
import { Button } from "../button";
import { CrossIcon } from "../icons";

export default function ToastModal({ isOpen, onClose, title, content }: ToastModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleCreateHabit = () => {
    router.push(`/habit/create?name=${encodeURIComponent(content)}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border-2 border-primary rounded-xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="transparent"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClose}
          aria-label="Fermer"
        >
          <CrossIcon />
        </Button>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
        </div>
        <p className="text-foreground mb-6">{content}</p>
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="small"
            onClick={handleCreateHabit}
          >
            Utiliser cette recommendation
          </Button>
        </div>
      </div>
    </div>
  );
}
