"use client";

import React from "react";
import { useRouter } from "next/navigation";
import FormUI from "@/components/ui/habit/form-ui";
import Categories from "@/components/ui/habit/categories";
import { Button } from "@/components/ui/button";

export type SimpleCategory = { id: number; name: string };

type Props = {
    categories: SimpleCategory[];
};

export default function CreateHabitForm({ categories }: Props) {
    const router = useRouter();
    const [name, setName] = React.useState("");
    const [categoryId, setCategoryId] = React.useState<number | null>(null);
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
                body: JSON.stringify({ name: name.trim(), categoryId }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? `HTTP ${res.status}`);
            }

            setSuccess(true);
            setName("");
            setCategoryId(null);

            // navigate back to main page
            router.push("/");
        } catch (err: any) {
            setError(err?.message ?? "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Créer une habitude">
            <FormUI
                name="name"
                value={name}
                onChange={(v) => {
                    setName(v);
                    if (error) setError(null);
                }}
                placeholder="Quelle est votre habitude en ce moment ?"
            />

            <div>
                <label className="text-sm mb-2 block">
                    Catégorie
                </label>

                <div
                    aria-required="true"
                    aria-invalid={categoryError ? "true" : "false"}
                    aria-describedby={categoryError ? "category-error" : undefined}
                >
                    <Categories
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

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            {success && <p className="text-sm text-success">Habitude créée.</p>}

            <div>
                {/* enable submit so validation runs; only disable while loading */}
                <Button type="submit" disabled={loading}>
                    {loading ? "Création..." : "Créer l'habitude"}
                </Button>
            </div>
        </form>
    );
}