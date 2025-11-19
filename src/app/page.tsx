'use client';

import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import HomeDisconnected from '@/components/home-disconnected';
import NoHabit from "@/components/ui/habit/no-habit";
import AddHabbitButton from "@/components/ui/habit/add-habit-button";

export default function Home() {
  const { data: session, status } = useSession();
  const userName = (session?.user as any)?.first_name
    ?? (session?.user?.name ? session.user.name.trim().split(/\s+/)[0] : undefined)
    ?? (session?.user?.email ? session.user.email.split('@')[0] : 'Anonymous');

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div>
      {session ? (
        <main className="w-full max-w-4xl mx-auto px-6 py-8 grid gap-8">
          <h1 id="welcome-heading" className="text-2xl font-semibold">
            Bienvenue, {userName}!
          </h1>
          <h2 className="text-lg text-foreground">Pensez à compléter vos habitudes du jour !</h2>
          <section aria-labelledby="habits-section" className="flex flex-col justify-center gap-9">
            <NoHabit />
            <AddHabbitButton />
          </section>
        </main>
      ) : (
        <HomeDisconnected />
      )}

      <footer
        className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"
        role="contentinfo"
      >
      </footer>
    </div>
  );
}
