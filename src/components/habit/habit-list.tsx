"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { HabitProps } from "@/types/ui";
import { parseISO, format, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";
import { DeleteIcon } from "@/components/ui/icons";

function formatIsoForUi(iso?: string | null) {
  if (!iso) return "";
  return format(parseISO(iso), "PPP", { locale: fr });
}

export default function HabitList({ items, className }: HabitProps) {
  const [localItems, setLocalItems] = useState(items ?? []);
  const [deletingIds, setDeletingIds] = useState<Array<string | number>>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    setDeletingIds((s) => [...s, id]);
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
    } catch (err) {
      console.error("Delete habit error:", err);
      alert("Erreur lors de la suppression.");
    } finally {
      setDeletingIds((s) => s.filter((x) => String(x) !== String(id)));
      closeDeleteDialog();
    }
  }

  return (
    <>
      <ul className={clsx("space-y-2", className)} role="list">
        {localItems.map((item) => {
          const Icon = item.Icon!;
          const isDeleting = deletingIds.includes(item.id as any);

          return (
            <li key={String(item.id)}>
              <div className="w-full flex items-center justify-betweenp-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                    )}
                    <p>{item.motivation}</p>

                    <p className="text-sm text-muted-foreground">
                      {item.periodStart && item.periodEnd ? (
                        <>
                          Du {formatIsoForUi(item.periodStart)}{" "}→{" "}{formatIsoForUi(item.periodEnd)}
                        </>
                      ) : (
                        (() => {
                          const single = item.periodStart ?? item.periodEnd ?? null;
                          if (!single) return "";
                          try {
                            const d = parseISO(single);
                            const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            const today = startOfToday();
                            if (dDay < today) return `depuis ${format(d, "PPP", { locale: fr })}`;
                            return `A partir du ${format(d, "PPP", { locale: fr })}`;
                          } catch (e) {
                            return formatIsoForUi(single);
                          }
                        })()
                      )}
                    </p>
                  </span>
                </div>

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    aria-label="Supprimer l'habitude"
                    className="p-1 rounded hover:bg-destructive/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => openDeleteDialog(item.id!)}
                    disabled={isDeleting}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Modal popin for delete confirmation */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeDeleteDialog}
            aria-hidden="true"
          />
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-medium mb-2">Supprimer l'habitude</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voulez-vous vraiment supprimer cette habitude ? Cette action est irréversible.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded border bg-transparent"
                onClick={closeDeleteDialog}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded bg-destructive text-white"
                onClick={confirmDelete}
                disabled={pendingDeleteId ? deletingIds.includes(pendingDeleteId) : false}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}