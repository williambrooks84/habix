import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ToastProps } from "@/types/ui";

export function Toast({ title, message }: ToastProps) {
    const router = useRouter();
    const firedRef = useRef(false);

    useEffect(() => {
        const key = `recommendation_shown_${title}_${message}`;
        if (sessionStorage.getItem(key) || firedRef.current) return;
        
        const timer = setTimeout(() => {
            firedRef.current = true;
            sessionStorage.setItem(key, 'true');
            window.dispatchEvent(new CustomEvent('recommendation:show', { 
                detail: { 
                    title, 
                    message,
                    onClick: () => {
                        router.push(`/habit/create?name=${encodeURIComponent(message)}`);
                    },
                } 
            }));
        }, 2000);
        return () => clearTimeout(timer);
    }, [title, message, router]);

    return null;
}