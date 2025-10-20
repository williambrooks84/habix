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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">Please log in to continue.</h1>

        <div className="w-full">
          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email address"
            required
            icon={<AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
          />

          <div className="mt-4">
            <FormInput
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              required
              icon={<KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
            />
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button type="submit" className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
