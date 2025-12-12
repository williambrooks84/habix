import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Mes Habitudes",
  description: "Gérez et suivez vos habitudes quotidiennes",
};

export default function HabitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
