"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPopin() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const hidePaths = ["/", "/login", "/signup"];
    const show = status !== "loading" && !session && Boolean(pathname) && !hidePaths.includes(pathname ?? "");

    React.useEffect(() => {
        if (!show) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const main = document.querySelector('main');
        const prevPointerEvents = main ? (main as HTMLElement).style.pointerEvents : '';
        const prevUserSelect = main ? (main as HTMLElement).style.userSelect : '';
        const prevFilter = main ? (main as HTMLElement).style.filter : '';
        if (main) {
            (main as HTMLElement).style.pointerEvents = 'none';
            (main as HTMLElement).style.userSelect = 'none';
            (main as HTMLElement).style.filter = 'blur(3px)';
            (main as HTMLElement).setAttribute('aria-hidden', 'true');
        }

        return () => {
            document.body.style.overflow = prevOverflow;
            if (main) {
                (main as HTMLElement).style.pointerEvents = prevPointerEvents;
                (main as HTMLElement).style.userSelect = prevUserSelect;
                (main as HTMLElement).style.filter = prevFilter;
                (main as HTMLElement).removeAttribute('aria-hidden');
            }
        };
    }, [show]);
    if (status === "loading") return null;

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className="relative w-full max-w-md mx-4 bg-background rounded-md p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
                <p className="text-sm text-muted-foreground mb-4">Pour accéder à cette page, veuillez vous connecter.</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="transparent" onClick={() => router.push('/')}>Retour</Button>
                    <Button onClick={() => router.push('/login')}>Se connecter</Button>
                </div>
            </div>
        </div>
    );
}
