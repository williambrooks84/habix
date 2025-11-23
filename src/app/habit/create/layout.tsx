import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habix - Créer une habitude",
  description: "Créer une habitude sur Habix.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            {children}
        </main>
    )
}