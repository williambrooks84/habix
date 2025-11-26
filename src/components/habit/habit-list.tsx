"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { HabitProps } from "@/types/ui";
import ListOverlay from "@/components/ui/habit/list-overlay";
import DeleteModal from "../ui/habit/delete-modal";

export default function HabitList({ items, className }: HabitProps) {
  const [localItems, setLocalItems] = useState(items ?? []);
  const [deletingIds, setDeletingIds] = useState<Array<string | number>>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    setLocalItems(items ?? []);
  }, [items]);

  function openDeleteDialog(id: string | number) {
    setPendingDeleteId(id);
    setModalOpen(true);
  }

  function closeDeleteDialog() {
    setPendingDeleteId(null);
    setModalOpen(false);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setDeletingIds((s: Array<string | number>) => [...s, id]);
    try {
      const res = await fetch("/api/habits/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.error) {
        console.error("Delete habit failed:", json?.error ?? res.statusText);
        alert("Impossible de supprimer l'habitude.");
        return;
      }
      setLocalItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
      setSelectedItem((s: any | null) => (s && String(s.id) === String(id) ? null : s));
    } catch (err) {
      console.error("Delete habit error:", err);
      alert("Erreur lors de la suppression.");
    } finally {
      setDeletingIds((s: Array<string | number>) => s.filter((x) => String(x) !== String(id)));
      closeDeleteDialog();
    }
  }

  return (
    <>
      <ul className={clsx("flex flex-wrap justify-center gap-4", className)} role="list">
        {localItems.map((item) => {
          const Icon = item.Icon!;

          const rawFreq =
            (item as any).frequencyType ??
            (item as any).frequency_type ??
            (item as any).freqType ??
            (item as any).frequency?.type ??
            (item as any).frequency?.frequencyType ??
            null;

          let freqText: string | null = null;
          if (!rawFreq) {
            freqText = null;
          } else if (rawFreq === "daily" || rawFreq === "quotidien") {
            freqText = "Quotidien";
          } else if (rawFreq === "weekly" || rawFreq === "hebdomadaire") {
            freqText = "Hebdomadaire";
          } else if (rawFreq === "weekly-multi") {
            freqText = "Hebdomadaire";
          } else if (rawFreq === "monthly") {
            freqText = "Mensuel";
          } else if (rawFreq === "monthly-multi") {
            freqText = "Mensuel";
          } else {
            freqText = String(rawFreq);
          }

          return (
            <li key={String(item.id)} className="flex-none">
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-[150px] h-[150px] rounded-xl"
                aria-haspopup="dialog"
              >
                <div
                  className={clsx(
                    "w-full h-full flex flex-col items-center justify-center rounded-lg border-2 border-primary"
                  )}
                >
                  <Icon />

                  <div className="text-center px-2 w-full flex flex-col">
                    <span className="text-sm font-medium text-foreground w-full truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray">{freqText}</span>
                  </div>
                </div>
              </button>

            </li>
          );
        })}
      </ul>

      <ListOverlay
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={(id) => openDeleteDialog(id)}
      />

      {modalOpen && (
        <DeleteModal
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          pendingDeleteId={pendingDeleteId}
          deletingIds={deletingIds}
        />
      )}
    </>
  );
}