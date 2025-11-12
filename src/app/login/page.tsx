import LoginForm from '@/components/ui/login-form';
import { Suspense } from 'react';
import Logos from '@/components/ui/logo';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[299px] flex-col gap-6 p-6 md:py-12">
        <h1 className="text-2xl font-semibold text-foreground mb-3">Connexion</h1>
        <p className="text-sm text-muted mb-4">Connectez-vous pour accéder à votre tableau de bord</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
