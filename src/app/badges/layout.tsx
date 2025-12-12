import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Badges",
  description: "Débloquez des badges en atteignant vos objectifs",
};

export default function BadgesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
