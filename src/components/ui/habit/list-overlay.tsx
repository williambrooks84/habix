import React from "react";
import { parseISO, startOfToday } from "date-fns";
import { formatIsoForUi } from '@/app/lib/format-date';
import { DeleteIcon, CrossIcon } from "../icons";
import { Button } from "../button";
import ListDetail from "./list-detail";
import { ListOverlayProps } from "@/types/ui";

export default function ListOverlay({ item, onClose, onDelete }: ListOverlayProps) {
  if (!item) return null;

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
    freqText = "Hebdomadaire (jours multiples)";
  } else if (rawFreq === "monthly") {
    freqText = "Mensuel";
  } else if (rawFreq === "monthly-multi") {
    freqText = "Mensuel (jours multiples)";
  } else {
    freqText = String(rawFreq);
  }

  const single = item.periodStart ?? item.periodEnd ?? null;
  const periodLabel = item.periodStart && item.periodEnd
    ? `Du ${formatIsoForUi(item.periodStart)} → ${formatIsoForUi(item.periodEnd)}`
    : single
      ? (() => {
          try {
            const d = parseISO(single);
            const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const today = startOfToday();
            if (dDay < today) return `depuis ${formatIsoForUi(single)}`;
            return `A partir du ${formatIsoForUi(single)}`;
          } catch {
            return formatIsoForUi(single);
          }
      })()
      : "";

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-sm mx-4 p-5 z-50" role="document">
        <Button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          variant="transparent"
          size="paddingless"
          className="absolute top-1 right-1"
        >
          <CrossIcon />
        </Button>
        <h2 className="text-2xl text-primary text-center font-semibold truncate">{item.name}</h2>

        <div className="mt-4 space-y-2">
          <ListDetail title="Période :">{periodLabel}</ListDetail>
          <ListDetail title="Fréquence :">{freqText}</ListDetail>
          <ListDetail title="Motivation :">{item.motivation}</ListDetail>
        </div>

        <Button
          type="button"
          className="mx-auto mt-4"
          onClick={() => onDelete(item.id)}
          aria-label="Supprimer l'habitude"
          variant="transparent"
          size="paddingless"
        >
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
}