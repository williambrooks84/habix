"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    const [name, setName] = React.useState("");
    const [categoryId, setCategoryId] = React.useState<number | null>(null);
    const [motivation, setMotivation] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [categoryError, setCategoryError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);
    const [startDate, setStartDate] = React.useState<string | null>(null);
    const [endDate, setEndDate] = React.useState<string | null>(null);
    const [color, setColor] = React.useState<string>("#04D6AB");

    const [frequency, setFrequency] = useState<{ type: FrequencyType; config?: FrequencyConfig }>(
        {
            type: "daily" as FrequencyType,
            config: { interval: 1 },
        }
    );

    useEffect(() => {
        if (!habit) return;
        const type = (habit.frequencyType as FrequencyType) ?? "daily";
        const config = (habit.frequencyConfig ?? undefined) as FrequencyConfig | undefined;
        setFrequency({ type, config });
    }, [habit]);

    // expose selected color as a CSS variable for preview / token usage
    useEffect(() => {
        try {
            document.documentElement.style.setProperty("--habit-selected-color", color);
        } catch {
            // ignore in non-browser environments
        }
    }, [color]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setCategoryError(null);
        setSuccess(false);

        if (!name.trim()) {
            setError("Le nom est requis");
            return;
        }

        if (categoryId == null) {
            setCategoryError("La catégorie est obligatoire");
            return;
        }

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-10" aria-label="Créer une habitude">
            <FormUI
                id="name"
                name="name"
                value={name}
                onChange={(v) => {
                    setName(v);
                    if (error) setError(null);
                }}
                placeholder="Quelle est votre habitude en ce moment ?"
            />

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
                        onSelect={(id) => {
                            setCategoryId(Number(id));
                            if (categoryError) setCategoryError(null);
                        }}
                    />
                </div>

                {categoryError && (
                    <p id="category-error" role="alert" className="text-sm text-destructive mt-2">
                        {categoryError}
                    </p>
                )}
            </div>
            <div>
                <FormField
                    id="motivation"
                    name="motivation"
                    value={motivation}
                    onChange={(v) => {
                        setMotivation(v);
                        if (error) setError(null);
                    }}
                    placeholder="Quelle est votre motivation ?"
                />
            </div>
            <div className="mb-4">
                <FrequencySelect value={frequency} onChange={setFrequency} />
            </div>
            <div>
                <DatePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={({ startDate, endDate }) => { setStartDate(startDate); setEndDate(endDate); }}
                    label="Période"
                />
            </div>

            <div className="flex flex-col gap-2">
                <FormLabel id="color" label="Couleur" />
                <p className="text-sm text-muted-foreground">Choisissez une couleur pour cette habitude (sera envoyée au serveur)</p>
                <div className="flex items-center gap-3 mt-2">
                    {[
                        "#04D6AB",
                        "#F97316",
                        "#F472B6",
                        "#60A5FA",
                        "#6C5CE7",
                        "#FFD166",
                        "#FF7A7A",
                    ].map((c) => (
                        <button
                            key={c}
                            type="button"
                            aria-label={`Choisir la couleur ${c}`}
                            onClick={() => setColor(c)}
                            className={"w-8 h-8 rounded-md border-2" + (color === c ? " ring-2 ring-offset-1 ring-primary" : "")}
                            style={{ backgroundColor: c }}
                        />
                    ))}

                    {/* custom color picker */}
                    <input
                        aria-label="Couleur personnalisée"
                        title="Couleur personnalisée"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-8 p-0 border rounded-md"
                    />
                </div>
            </div>


            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            {success && <p className="text-sm text-success">Habitude créée.</p>}

            <div className="flex justify-center">
                <Button type="submit" disabled={loading}>
                    {loading ? "Création..." : "Créer l'habitude"}
                </Button>
            </div>
        </form>
    );
}