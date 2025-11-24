"use client";

import React from "react";
import { useRouter } from "next/navigation";
import FormUI from "@/components/ui/habit/form-ui";
import Categories from "@/components/ui/habit/categories";
import { Button } from "@/components/ui/button";
import FormLabel from "@/components/ui/habit/form-label";
import FormField from "../ui/habit/form-field";
import { HabitFormProps } from "@/types/ui";

export default function CreateHabitForm({ categories }: HabitFormProps) {
    const router = useRouter();
    const [name, setName] = React.useState("");
    const [categoryId, setCategoryId] = React.useState<number | null>(null);
    const [motivation, setMotivation] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [categoryError, setCategoryError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);

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
                body: JSON.stringify({ name: name.trim(), categoryId, motivation }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? `HTTP ${res.status}`);
            }

            setSuccess(true);
            setName("");
            setMotivation("");
            setCategoryId(null);

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