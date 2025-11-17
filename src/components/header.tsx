'use client';
import { useState } from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BurgerMenuIcon } from '@/components/ui/icons';
import MenuOverlay from '@/components/menu-overlay';
import { getInitialTheme, applyTheme } from '@/app/lib/theme-toggle';

export default function Header() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const t = getInitialTheme();
      applyTheme(t);
    } catch (e) {}
  }, []);

  const hideOn = ['/login', '/signup'];
  const showBurger = !hideOn.some((p) => pathname.startsWith(p));

  return (
    <>
      <header className="w-full px-4 py-3 flex items-center ">
        <div>
          {showBurger && (
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setOpen(true)}
              className="rounded-md p-2 hover:bg-muted/10"
            >
              <BurgerMenuIcon />
            </button>
          )}
        </div>
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}