import React, { useEffect, useState } from "react";
import { ToastProps } from "@/types/ui";
import ToastModal from "./toast-modal";
import { Button } from "../button";
import { CrossIcon } from "../icons";

export function Toast({ title, message }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleToastClick = () => {
        setModalOpen(true);
    };

    return (
        <>
            {visible && (
                <div 
                    className="fixed bottom-22 inset-x-3 mt-2 w-auto max-w-full sm:max-w-md md:max-w-lg border-2 border-primary bg-background rounded-xl px-4 py-3 flex justify-between items-center gap-3 z-50 overflow-x-auto translate ease-in duration-300 cursor-pointer hover:bg-muted/50 transition"
                    onClick={handleToastClick}
                >
                    <div className="flex flex-col">
                        <h3 className="text-lg font-medium text-primary">
                            {title}
                        </h3>
                        <p className="text-sm font-normal text-foreground">
                            {message}
                        </p>
                    </div>
                    <Button
                        variant="transparent"
                        size="paddingless"
                        onClick={(e) => {
                            e.stopPropagation();
                            setVisible(false);
                        }}
                        aria-label="Fermer"
                    >
                        <CrossIcon/>
                    </Button>
                </div>
            )}

            <ToastModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={title}
                content={message}
            />
        </>
    );
}