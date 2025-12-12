'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BurgerMenuIcon, ProfileIcon, NotificationIcon } from '@/components/ui/icons';
import MenuOverlay from '@/components/menu-overlay';
import NotificationOverlay from '@/components/notification-overlay';
import NotificationBadge from '@/components/ui/notification-badge';
import { getInitialTheme, applyTheme } from '@/app/lib/theme-toggle';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/profile/avatar';
import { useSession } from 'next-auth/react';
import PointsDisplay from '@/components/ui/profile/points-display';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Fetch unread count periodically
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    // Fetch immediately on mount
    fetchUnreadCount();

    // Then set up interval to sync every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    try {
      const t = getInitialTheme();
      applyTheme(t);
    } catch (e) { }
  }, []);

  const hideOn = ['/login', '/signup'];
  const showHeader = !hideOn.some((p) => pathname.startsWith(p));

  if (!mounted) return null;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 h-14 px-4 flex items-center bg-background">
        {showHeader && (
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setOpen(true)}
              className="rounded-md p-2 hover:bg-muted/10"
            >
              <BurgerMenuIcon />
            </button>
            <div className="flex items-center gap-3">
              {status === 'authenticated' && <PointsDisplay />}
              {status === 'authenticated' && (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setNotificationOpen(true)}
                    className="rounded-md p-2 hover:bg-muted/10"
                  >
                    <NotificationIcon />
                  </button>
                  <NotificationBadge count={unreadCount} />
                </div>
              )}
              <button
                type="button"
                aria-label="Votre profil"
                onClick={() => router.push('/profile')}
                className="rounded-md p-2 hover:bg-muted/10"
              >
                {status === 'authenticated' ? <Avatar /> : <ProfileIcon />}
              </button>
            </div>
          </div>
        )}
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
      <NotificationOverlay 
        open={notificationOpen} 
        onClose={() => setNotificationOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
}