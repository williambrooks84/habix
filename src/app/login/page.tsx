import LoginForm from '@/components/ui/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main >
      <div className="flex flex-col px-6">
        <h1 className="text-2xl font-semibold text-foreground">Connexion</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
