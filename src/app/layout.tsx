import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/wrappers/SessionProviderWrapper";
import Header from '@/components/header';
import AddHabitButton from '@/components/ui/habit/add-habit-button';
import LoginPopin from '@/components/ui/auth/login-popin';

export const metadata: Metadata = {
  title: "Habix - Accueil",
  description: "Bienvenue sur Habix.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <SessionProviderWrapper>
          <Header />
          <main className="mt-14 h-[calc(100vh-56px)]">
            {children}
          </main>
          <AddHabitButton />
          <LoginPopin />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
