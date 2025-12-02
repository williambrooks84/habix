import type { ReactNode } from "react";
import Header from "@/components/ui/auth/header";

export const metadata = {
  title: "Login - Habix",
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative w-full h-full min-h-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex flex-col gap-8">
        <Header/>
        <section id="signup-content" aria-labelledby="signup-heading">
          {children}
        </section>
      </div>
    </main>
  );
}
