import type { ReactNode } from "react";
import Header from "@/components/ui/header";

export const metadata = {
  title: "Login - Habix",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <article
        className="w-full max-w-md flex flex-col gap-8"
        role="region"
        aria-labelledby="signup-heading"
      >
        <Header/>
        <section id="signup-content" aria-labelledby="signup-heading">
          {children}
        </section>
      </article>
    </main>
  );
}
