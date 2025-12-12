import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Calendrier",
  description: "Visualisez votre progression au calendrier",
};

export default function CalendarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
