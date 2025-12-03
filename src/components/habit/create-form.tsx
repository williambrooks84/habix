"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormUI from "@/components/ui/habit/form-ui";
import Categories from "@/components/ui/habit/categories";
import { Button } from "@/components/ui/button";
import FormLabel from "@/components/ui/habit/form-label";
import FormField from "../ui/habit/form-field";
import { HabitFormProps } from "@/types/ui";
import DatePicker from "@/components/ui/habit/date-picker";
import FrequencySelect from "@/components/ui/habit/frequency";
import type { FrequencyType, FrequencyConfig } from "@/app/types";

export default function CreateHabitForm({ categories, habit }: HabitFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams?.get("name") ?? "";
  const [name, setName] = React.useState(initialName);
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [motivation, setMotivation] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [categoryError, setCategoryError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [startDate, setStartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);
  const [color, setColor] = React.useState<string>("#04D6AB");

  const [motivationError, setMotivationError] = React.useState<string | null>(null);
  const [periodError, setPeriodError] = React.useState<string | null>(null);
  const [colorError, setColorError] = React.useState<string | null>(null);

  const [frequency, setFrequency] = useState<{ type: FrequencyType; config?: FrequencyConfig }>(
    { type: "daily" as FrequencyType, config: { interval: 1 } }
  );

  useEffect(() => {
    if (!habit) return;
    const type = (habit.frequencyType as FrequencyType) ?? "daily";
    const config = (habit.frequencyConfig ?? undefined) as FrequencyConfig | undefined;
    setFrequency({ type, config });
  }, [habit]);

  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--habit-selected-color", color);
    } catch {
      // ignore 
    }
  }, [color]);

  const isValidDateStr = React.useCallback(
    (s: string | null) => !!s && !Number.isNaN(new Date(s).getTime()),
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setCategoryError(null);
    setMotivationError(null);
    setPeriodError(null);
    setColorError(null);
    setSuccess(false);

    let hasError = false;
    
    if (!name.trim()) {
      setNameError("Le nom est requis");
      hasError = true;
    }
    if (categoryId == null) {
      setCategoryError("La catégorie est requise");
      hasError = true;
    }
    if (!motivation.trim()) {
      setMotivationError("La motivation est requise");
      hasError = true;
    }
    
    if (!isValidDateStr(startDate)) {
      setPeriodError("La date de début est requise");
      hasError = true;
    } else if (endDate && isValidDateStr(endDate) && new Date(startDate!) > new Date(endDate!)) {
      setPeriodError("La date de début doit précéder la date de fin");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await fetch("/api/habits/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          motivation,
          color,
          periodStart: startDate,
          periodEnd: endDate,
          frequency_type: frequency.type,
          frequency_config: frequency.config ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      setSuccess(true);
      setName("");
      setMotivation("");
      setCategoryId(null);
      setColor("#04D6AB");
      setFrequency({ type: "daily", config: { interval: 1 } });

      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:max-w-2/3 lg:max-w-1/2" aria-label="Créer une habitude">
      <div>
        <FormUI
          id="name"
          name="name"
          value={name}
          onChange={(v) => { setName(v); if (nameError) setNameError(null); }}
          placeholder="Quelle est votre habitude en ce moment ?"
          aria-required="true"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "name-error" : undefined}
        />
        {nameError && <p id="name-error" role="alert" className="text-sm text-destructive mt-2">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <FormLabel id="category" label="Catégorie" />
        <div
          aria-required="true"
          aria-invalid={categoryError ? "true" : "false"}
          aria-describedby={categoryError ? "category-error" : undefined}
        >
          <Categories
            id="category"
            categories={categories}
            selectedId={categoryId}
            onSelect={(id) => { setCategoryId(Number(id)); if (categoryError) setCategoryError(null); }}
          />
        </div>
        {categoryError && <p id="category-error" role="alert" className="text-sm text-destructive mt-2">{categoryError}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <FormLabel id="motivation" label="Motivation" />
        <FormField
          id="motivation"
          name="motivation"
          value={motivation}
          onChange={(v) => { setMotivation(v); if (motivationError) setMotivationError(null); }}
          placeholder="Quelle est votre motivation ?"
          aria-required="true"
          aria-invalid={!!motivationError}
          aria-describedby={motivationError ? "motivation-error" : undefined}
        />
        {motivationError && <p id="motivation-error" role="alert" className="text-sm text-destructive mt-2">{motivationError}</p>}
      </div>

      <div className="mb-4">
        <FrequencySelect value={frequency} onChange={setFrequency} />
      </div>

      <div aria-invalid={!!periodError} aria-describedby={periodError ? "period-error" : undefined}>
        <FormLabel id="period" label="Période" />
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={({ startDate, endDate }) => {
            setStartDate(startDate);
            setEndDate(endDate);
            if (periodError) setPeriodError(null);
          }}
        />
        {periodError && <p id="period-error" className="text-sm text-destructive mt-2">{periodError}</p>}
      </div>

      <div className="flex flex-col gap-2" aria-invalid={!!colorError} aria-describedby={colorError ? "color-error" : undefined}>
        <FormLabel id="color" label="Couleur" />
        <div className="flex items-center gap-3 mt-2">
          {["#04D6AB","#F97316","#F472B6","#60A5FA","#6C5CE7","#FFD166","#FF7A7A"].map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Choisir la couleur ${c}`}
              onClick={() => { setColor(c); if (colorError) setColorError(null); }}
              className={"w-8 h-8 rounded-md border-2" + (color === c ? " ring-2 ring-offset-1 ring-primary" : "")}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            id="color"
            aria-label="Couleur personnalisée"
            title="Couleur personnalisée"
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); if (colorError) setColorError(null); }}
            className="w-10 h-8 p-0 border rounded-md"
          />
        </div>
        {colorError && <p id="color-error" role="alert" className="text-sm text-destructive mt-2">{colorError}</p>}
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Habitude créée.</p>}

      <div className="flex justify-center mt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer l'habitude"}
        </Button>
      </div>
    </form>
  );
}