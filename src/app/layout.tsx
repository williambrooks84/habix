import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/wrappers/SessionProviderWrapper";
import Header from '@/components/header';
import AddHabitButton from '@/components/ui/habit/add-habit-button';
import LoginPopin from '@/components/ui/auth/login-popin';
import { ProfilePictureProvider } from "@/components/wrappers/ProfilePictureContext";
import { PointsProvider } from '@/components/wrappers/PointsContext';

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
          <ProfilePictureProvider>
            <PointsProvider>
              <Header />
              <main className="mt-14 h-[calc(100vh-56px)]">
                {children}
              </main>
              <AddHabitButton />
              <LoginPopin />
            </PointsProvider>
          </ProfilePictureProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
