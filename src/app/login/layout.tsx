import type { ReactNode } from "react";
import Header from "@/components/ui/auth/header";

export const metadata = {
  title: "Login - Habix",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative w-full h-full min-h-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex flex-col gap-16">
        <Header/>
        <section id="login-content" aria-labelledby="login-heading">
          {children}
        </section>
      </div>
    </main>
  );
}
