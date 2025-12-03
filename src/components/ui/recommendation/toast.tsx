import React, { useEffect, useState } from "react";
import { ToastProps } from "@/types/ui";


export function Toast({ title, message }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {visible && (
                <div className="fixed bottom-22 inset-x-2 mt-2 w-auto max-w-full sm:max-w-md md:max-w-lg border-2 border-primary bg-background rounded-xl px-4 py-3 flex justify-between items-center gap-3 z-50 overflow-x-auto translate ease-in duration-300">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-medium text-primary">
                            {title}
                        </h3>
                        <p className="text-sm font-normal text-foreground">
                            {message}
                        </p>
                    </div>
                    <button
                        className="ml-2 text-lg text-muted-foreground hover:text-foreground"
                        onClick={() => setVisible(false)}
                        aria-label="Fermer"
                    >
                        &times;
                    </button>
                </div>
            )}
        </>
    );
}