import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Recommandations",
  description: "Découvrez des habitudes recommandées",
};

export default function RecommendationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
