'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BurgerMenuIcon, ProfileIcon } from '@/components/ui/icons';
import MenuOverlay from '@/components/menu-overlay';
import { getInitialTheme, applyTheme } from '@/app/lib/theme-toggle';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/profile/avatar';
import { useSession } from 'next-auth/react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

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
            <button
              type="button"
              aria-label="Votre profil"
              onClick={() => router.push('/profile')}
              className="rounded-md p-2 hover:bg-muted/10"
            >
              {status === 'authenticated' ? <Avatar /> : <ProfileIcon />}
            </button>
          </div>
        )}
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}