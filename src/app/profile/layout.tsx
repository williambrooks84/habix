import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Mon Profil",
  description: "Gérez votre profil et vos paramètres",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
