import type { ReactNode } from "react";
import Header from "@/components/ui/header";

export const metadata = {
  title: "Login - Habix",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <article
        // dark card to match the Figma look, with internal padding so the logo never touches edges
        className="w-full max-w-md p-8 rounded-2xl shadow-lg text-white"
        role="region"
        aria-labelledby="login-heading"
      >
        <Header/>
        <section id="login-content" aria-labelledby="login-heading">
          {children}
        </section>
      </article>
    </main>
  );
}
