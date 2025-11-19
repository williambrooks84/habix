'use client';

import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import HomeDisconnected from '@/components/home-disconnected';
import { DivideIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || session?.user?.email || "Anonymous";

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div>
      {session ? (
        <main
          className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"
          aria-labelledby="welcome-heading"
        >
          <article>
            <h1 id="welcome-heading" className="text-3xl font-semibold">
              Bienvenue, {userName}!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Contenu personnalisé disponible une fois connecté.
            </p>
          </article>
        </main>
      ) : (
        <HomeDisconnected />
      )}

      <footer
        className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"
        role="contentinfo"
      >
        {/* ... */}
      </footer>
    </div>
  );
}
