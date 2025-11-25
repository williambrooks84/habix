"use client";

import React from "react";
import { DayPicker } from "react-day-picker";
import { format, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";
import { DatePickerProps } from "@/types/ui";
import "react-day-picker/style.css";

function toDate(iso?: string | null) {
  if (!iso) return undefined;
  const parts = iso.split("-");
  if (parts.length !== 3) return undefined;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day);
}

function toISODate(d?: Date | null) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DatePicker({
  startDate,
  endDate,
  onChange,
  label = "Dates",
  allowRange = true,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalRange, setInternalRange] = React.useState<{ from?: Date; to?: Date }>(() => ({
    from: toDate(startDate),
    to: toDate(endDate),
  }));
  const [rangeMode, setRangeMode] = React.useState<boolean>(!!endDate);
  const scrollPosRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setInternalRange({ from: toDate(startDate), to: toDate(endDate) });
    setRangeMode(!!endDate);
  }, [startDate, endDate]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (open) {
      scrollPosRef.current = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      if (scrollPosRef.current !== null) {
        const y = scrollPosRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, y);
        scrollPosRef.current = null;
      }
    }

    return () => {
      if (scrollPosRef.current !== null) {
        const y = scrollPosRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, y);
        scrollPosRef.current = null;
      }
    };
  }, [open]);

  function apply() {
    onChange({
      startDate: internalRange.from ? toISODate(internalRange.from) : null,
      endDate: internalRange.to ? toISODate(internalRange.to) : null,
    });
    setOpen(false);
  }

  function clear() {
    setInternalRange({ from: undefined, to: undefined });
    onChange({ startDate: null, endDate: null });
    setOpen(false);
  }

  const labelText =
    internalRange.from && internalRange.to
      ? `${format(internalRange.from!, "PPP", { locale: fr })} → ${format(
        internalRange.to!,
        "PPP",
        { locale: fr }
      )}`
      : internalRange.from
        ? `${format(internalRange.from!, "PPP", { locale: fr })}`
        : "Choisir une période";

  return (
    <div className="relative w-full">
      <label className="text-base font-medium mb-1 block">{label}</label>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left text-sm border-3 text-primary border-foreground rounded-3xl px-3 py-2"
      >
        {labelText}
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 left-0 bg-background bottom-full mb-2 p-3 rounded shadow-lg w-full">
            <div className="flex items-center gap-3 mb-3">
              {allowRange && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rangeMode}
                    onChange={(e) => {
                      setRangeMode(e.target.checked);
                      if (!e.target.checked) setInternalRange((r) => ({ from: r.from, to: undefined }));
                    }}
                  />
                  <span>Date de fin</span>
                </label>
              )}
              <div className="ml-auto flex gap-2">
                <button className="px-2 py-1 text-sm text-foreground" onClick={clear}>
                  Effacer
                </button>
                <button className="px-2 py-1 bg-primary text-foreground rounded" onClick={apply}>
                  OK
                </button>
              </div>
            </div>

            <DayPicker
                {...({
                mode: rangeMode ? "range" : "single",
                selected: rangeMode ? { from: internalRange.from, to: internalRange.to } : internalRange.from,
                onSelect: (sel: any) => {
                  if (rangeMode) {
                  const r = sel as { from?: Date; to?: Date } | undefined;
                  setInternalRange({ from: r?.from, to: r?.to });
                  } else {
                  const d = sel as Date | undefined;
                  setInternalRange({ from: d, to: undefined });
                  }
                },
                captionLayout: "dropdown",
                disabled: { before: minDate ?? startOfToday() },
                fromDate: minDate,
                toDate: maxDate,
                fromMonth: minDate ?? startOfToday(),
                toMonth: new Date(new Date().getFullYear() + 10, 11, 31),
                locale: fr,
                } as any)}
            />
          </div>
        </>
      )}
    </div>
  );
}