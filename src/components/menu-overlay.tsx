import { useEffect, useRef } from "react";
import ThemeToggle from "@/components/ui/theme-toggle/theme-toggle";

type MenuOverlayProps = {
    open: boolean;
    onClose: () => void;
};

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
    const overlayRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;

        function handleOutsideClick(e: Event) {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <nav ref={overlayRef} className="absolute w-1/2 mt-6" aria-label="Navigation principale">
            <ul className="flex flex-col gap-1">
                <li className="pt-4">
                    <div className="flex items-center justify-between">
                        <ThemeToggle />
                    </div>
                </li>
            </ul>
        </nav>
    );
}