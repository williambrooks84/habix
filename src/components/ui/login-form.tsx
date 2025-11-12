'use client';

import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from './form-input';
import { signIn } from "next-auth/react";

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
    const res = await signIn("credentials", {
      redirect: false,
      email: fd.get("email"),
      password: fd.get("password"),
    });
    setIsPending(false);
    if (res?.ok) {
      router.push('/');
    } else {
      setErrorMessage("Invalid email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="w-full">

        <div className="w-full">
          <FormInput
            id="email"
            name="email"
            label="Adresse mail"
            type="email"
            placeholder="vous@exemple.com"
            required
            className="h-[63px]"
            icon={<AtSymbolIcon className="h-5 w-5" />}
          />

          <div className="mt-4">
            <FormInput
              id="password"
              name="password"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              required
              className="h-[63px]"
              icon={<KeyIcon className="h-5 w-5" />}
            />
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button type="submit" className="mt-6 w-full" aria-disabled={isPending}>
          Se connecter
        </Button>

        <div className="flex items-center justify-center mt-4 text-center" aria-live="polite" aria-atomic="true">
          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : (
            <div className="text-sm text-muted">Pas encore de compte ? <a href="/signup" className="text-primary font-medium ml-2">S’inscrire</a></div>
          )}
        </div>
      </div>
    </form>
  );
}
