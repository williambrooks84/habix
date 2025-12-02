"use client";
import { useEffect, useRef, useState } from "react";
import { MenuOverlayProps } from "@/types/ui";
import MenuItem from '@/components/ui/menu/menu-item';
import ThemeToggle from '@/components/ui/theme-toggle/theme-toggle';
import { Button } from '@/components/ui/button';
import { CrossIcon, LoginIcon, LogoutIcon, HomeIcon, HabitsIcon, CalendarIcon } from '@/components/ui/icons';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
    const { data: session } = useSession();
    const overlayRef = useRef<HTMLElement | null>(null);
    const router = useRouter();

    const [visible, setVisible] = useState(open);
    const [active, setActive] = useState(false);

    const navItems = [
        {
            label: 'Accueil',
            icon: HomeIcon,
            onClick: () => router.push('/'),
        },
        {
            label: 'Habitudes',
            icon: HabitsIcon,
            onClick: () => router.push('/habit'),
        }, 
        {
            label: 'Calendrier',
            icon: CalendarIcon,
            onClick: () => router.push('/calendar'),
        }
    ]

    useEffect(() => {
        let enterTimer: number | undefined;
        if (open) {
            setVisible(true);
            enterTimer = window.setTimeout(() => {
                requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)));
            }, 50);
            return () => {
                if (enterTimer) clearTimeout(enterTimer);
            };
        }

        setActive(false);
        const t = window.setTimeout(() => setVisible(false), 240);
        return () => clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (!visible) return;

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
    }, [visible, onClose]);

    if (!visible) return null;

    const wrapAndClose = (cb?: (...args: any[]) => any) => {
        return async (...args: any[]) => {
            try {
                await cb?.(...args);
            } catch (err) {
            } finally {
                onClose();
            }
        };
    };

    return (
        <>
            <div
                aria-hidden="true"
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <nav
                ref={overlayRef}
                className={`fixed top-0 left-0 w-2/3 sm:w-1/2 md:w-1/3 lg:max-w-sm xl:max-w-md h-full z-50 bg-background/90 backdrop-blur-md rounded-md shadow-lg p-4 transform transition-transform duration-200 ease-out ${active ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Navigation principale"
                onClick={(e) => e.stopPropagation()}
            >
                <ul className="flex flex-col gap-1">
                    <MenuItem>
                        <ThemeToggle />
                        <Button variant="transparent" size="paddingless" onClick={onClose}>
                            <CrossIcon />
                        </Button>
                    </MenuItem>

                     {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <MenuItem key={idx}>
                                <Button variant="transparent" size="nav" onClick={wrapAndClose(item.onClick)}>
                                    {Icon ? <Icon /> : null}
                                    <span className="">{item.label}</span>
                                </Button>
                            </MenuItem>
                        );
                    })}

                    {session?.user ? (
                        <MenuItem>
                            <div className="flex justify-center w-full">
                                <Button size="small" onClick={wrapAndClose(() => signOut())}>
                                    <LogoutIcon />
                                    <span className="ml-2">Se déconnecter</span>
                                </Button>
                            </div>
                        </MenuItem>
                    ) : (
                        <MenuItem>
                            <div className="flex justify-center w-full">
                                <Button size="small" onClick={wrapAndClose(() => router.push('/login'))}>
                                    <LoginIcon />
                                    <span className="ml-2">Se connecter</span>
                                </Button>
                            </div>
                        </MenuItem>
                    )}
                </ul>
            </nav>
        </>
    );
}