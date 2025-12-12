"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from '@/components/ui/button';
import { CrossIcon, CheckIconValid } from '@/components/ui/icons';
import { useSession } from 'next-auth/react';
import { NotificationOverlayProps } from "@/types/ui";
import { Notification } from "@/app/types";

export default function NotificationOverlay({ open, onClose, onUnreadCountChange }: NotificationOverlayProps) {
    const { data: session } = useSession();
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const [visible, setVisible] = useState(open);
    const [active, setActive] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && session?.user) {
            setLoading(true);
            fetch('/api/notifications')
                .then(res => res.json())
                .then(data => {
                    setNotifications(data.notifications || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch notifications:', err);
                    setLoading(false);
                });
        }
    }, [open, session]);

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

    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.read).length;
        onUnreadCountChange?.(unreadCount);
    }, [notifications, onUnreadCountChange]);

    const markAsRead = async (notificationId: number) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteNotification = async (notificationId: number) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    if (!visible) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <div
                aria-hidden="true"
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[74] transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div
                ref={overlayRef}
                className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-1/3 lg:max-w-sm xl:max-w-md h-full z-[75] bg-background/90 backdrop-blur-md rounded-md shadow-lg p-4 transform transition-transform duration-200 ease-out ${active ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-label="Notifications"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 pb-3">
                        <h2 className="text-xl font-semibold text-foreground">
                            Notifications {unreadCount > 0 && <span className="text-sm text-muted-foreground">({unreadCount})</span>}
                        </h2>
                        <Button variant="transparent" size="icon" onClick={onClose} aria-label="Fermer">
                            <CrossIcon />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-center text-muted-foreground py-8">
                                Chargement...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Aucune notification
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {notifications.map((notif) => (
                                    <li
                                        key={notif.id}
                                        className={`p-3 rounded-lg border transition-colors ${notif.read
                                                ? 'bg-background/50 border-muted/50'
                                                : 'bg-primary/5 border-primary/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-foreground text-sm mb-1">
                                                    {notif.title}
                                                </h3>
                                                {notif.body && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {notif.body}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {(() => {
                                                        const d = new Date(notif.created_at);
                                                        const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                                                        const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                        return `${dateStr} ${timeStr}`;
                                                    })()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 items-center">
                                                {!notif.read && (
                                                    <Button
                                                        onClick={() => markAsRead(notif.id)}
                                                        variant="transparent"
                                                        size="paddingless"
                                                        aria-label="Marquer comme lu"
                                                    >
                                                        <CheckIconValid />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    variant="transparent"
                                                    size="paddingless"
                                                    aria-label="Supprimer"
                                                >
                                                    <CrossIcon />
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {notifications.length > 0 && unreadCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-muted flex justify-center">
                            <Button
                                variant="transparent"
                                size="small"
                                onClick={markAllAsRead}
                                className="text-xs"
                            >
                                marquer tous comme lus
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
