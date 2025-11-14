import SignupForm from '@/components/ui/signup-form';
import { Suspense } from 'react';

export default function SignupPage() {
  return (
    <main>
      <div className="flex flex-col px-6">
        <h1 className="text-2xl font-semibold text-foreground">Inscription</h1>
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  );
}
