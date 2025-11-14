import type { ReactNode } from "react";
import Header from "@/components/ui/auth/header";

export const metadata = {
  title: "Login - Habix",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <article
        className="w-full max-w-md flex flex-col gap-16"
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
