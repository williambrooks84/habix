import React from 'react'
import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/wrappers/SessionProviderWrapper";
import Header from '@/components/header';
import AddHabitButton from '@/components/ui/habit/add-habit-button';
import LoginPopin from '@/components/ui/auth/login-popin';
import { ProfilePictureProvider } from "@/components/wrappers/ProfilePictureContext";
import { PointsProvider } from '@/components/wrappers/PointsContext';
import ToastContainer from '@/components/ui/toasts/toast-container';
import BadgesToast from '@/components/ui/badges/badges-toast';

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
              <React.Suspense fallback={null}>
                <BadgesToast />
                <ToastContainer />
              </React.Suspense>
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
