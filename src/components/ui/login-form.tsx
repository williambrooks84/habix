'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from './form-input';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: false,
      email: fd.get('email'),
      password: fd.get('password'),
    });
    setIsPending(false);
    if (res?.ok) {
      router.push('/');
    } else {
      setErrorMessage('Invalid email or password.');
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full flex mx-auto flex-col gap-4 mt-6"
        aria-live="polite"
      >
        <div className="flex flex-col gap-4">
          <FormInput
            id="email"
            name="email"
            label="Adresse mail"
            type="email"
            placeholder="vous@exemple.com"
            required
          />

          <FormInput
            id="password"
            name="password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button
          type="submit"
          variant="primary"
          size="normal"
          className="mt-2"
          disabled={isPending}
        >
          Se connecter
        </Button>

        {errorMessage && (
          <div className="flex items-center justify-center mt-2 text-center">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}
      </form>

      <div className="flex items-center justify-center text-center mt-16">
        <p className="text-lg text-foreground">
          Pas encore de compte ?
          <a href="/signup" className="text-primary font-medium ml-2">
            S’inscrire
          </a>
        </p>
      </div>
    </>
  );
}
