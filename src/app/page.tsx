'use client';

import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";

export default function Home() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || session?.user?.email || "Anonymous";

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p>Welcome back, {userName}!</p>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* ... */}
      </footer>
    </div>
  );
}
