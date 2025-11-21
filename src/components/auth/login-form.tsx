'use client';

import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from '../ui/auth/form-input';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // form state and validation
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const verifyEmailFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function handleChange(field: 'email' | 'password', value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setAuthError(null);

    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: verifyEmailFormat(value) ? null : "Email invalide" }));
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: null }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    // final client-side check
    const emailErr = verifyEmailFormat(form.email) ? null : "Email invalide";

    if (emailErr) return;

    // Use a full redirect so the authentication cookie is set by the
    // server response (more reliable in deployed environments).
    setIsPending(true);
    // Default `redirect` for next-auth `signIn` is `true` — we don't await
    // because the browser will navigate on success and this code won't continue.
    // Provide `callbackUrl` so the user returns to the correct page.
    signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: callbackUrl || '/',
    });
    // Note: we don't set isPending false here because the page will navigate.
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex mx-auto flex-col gap-4 mt-6" aria-live="polite">
        <div className="flex flex-col gap-4">
          <FormInput
            id="email"
            name="email"
            label="Adresse mail"
            type="email"
            placeholder="vous@exemple.com"
            required
            value={form.email}
            onChange={(v) => handleChange('email', v)}
            error={errors.email ?? null}
          />

          <FormInput
            id="password"
            name="password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(v) => handleChange('password', v)}
            error={errors.password ?? null}
          />
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button type="submit" variant="primary" size="normal" className="mt-2 w-full" disabled={isPending}>
          Se connecter
        </Button>

        {authError && (
          <div className="flex items-center justify-center mt-2 text-center">
            <ExclamationCircleIcon className="h-5 w-5" style={{ color: 'var(--error-color)' }} />
            <p className="ml-2 text-sm" style={{ color: 'var(--error-color)' }}>{authError}</p>
          </div>
        )}
      </form>

      <div className="flex items-center justify-center text-center mt-16">
        <p className="text-lg text-foreground">
          Pas encore de compte ?
          <a href="/signup" className="text-primary font-medium ml-2">S’inscrire</a>
        </p>
      </div>
    </>
  );
}
