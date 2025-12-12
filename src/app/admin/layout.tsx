import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Backoffice",
  description: "Panneau de gestion Habix",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
