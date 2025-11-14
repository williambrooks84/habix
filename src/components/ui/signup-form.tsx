'use client';

import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useActionState, useState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import FormInput from './form-input';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, , isPending] = useActionState(authenticate, undefined);
  const [clientError, setClientError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', confirmpassword: '', firstName: '', lastName: '' });
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);

    const fd = new FormData(e.currentTarget);

    const validationError = validateFormData(fd);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    const payload = Object.fromEntries(fd.entries());
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      // Email already exists in database
      setClientError('Email already in use. If this is your email, try logging in or reset your password.');
      return;
    }

    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      setClientError(result.error || 'Signup failed. Please try again.');
      return;
    }

    // Success
    router.push('/login');
  }

  function verifyEmailFormat(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isPasswordStrong(password: string) {
    const checks = {
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'`~+=/]/.test(password),
    };
    return checks;
  }

  function validateFormData(formData: FormData): string | null {
    const firstName = (formData.get('firstName') as string) ?? '';
    const lastName = (formData.get('lastName') as string) ?? '';
    const email = (formData.get('email') as string) ?? '';
    const password = (formData.get('password') as string) ?? '';
    const confirmPassword = (formData.get('confirmpassword') as string) ?? '';

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return 'Please fill in all required fields.';
    }

    if (!verifyEmailFormat(email)) {
      return 'Invalid email address.';
    }

    const pwChecks = isPasswordStrong(password);
    const missing: string[] = [];
    if (!pwChecks.length) missing.push('at least 8 characters');
    if (!pwChecks.number) missing.push('a number');
    if (!pwChecks.uppercase) missing.push('an uppercase letter');
    if (!pwChecks.special) missing.push('a special character');

    if (missing.length > 0) {
      return `Le mot de passe doit inclure ${missing.join(', ')}.`;
    }

    if (password !== confirmPassword) {
      return 'Les mots de passe ne sont pas identiques.';
    }

    return null;
  }

  function handleChange(name: string, val: string) {
    setForm(prev => ({ ...prev, [name]: val }));
    const err = name === 'email'
      ? (verifyEmailFormat(val) ? null : 'Email invalide')
      : name === 'password'
      ? (() => {
          const checks = isPasswordStrong(val);
          const missing: string[] = [];
          if (!checks.length) missing.push('au moins 8 caractères');
          if (!checks.number) missing.push('un nombre');
          if (!checks.uppercase) missing.push('une lettre majuscule');
          if (!checks.special) missing.push('un caractère spécial');
          return missing.length > 0 ? `Le mot de passe doit inclure ${missing.join(', ')}.` : null;
        })()
      : null;
    setErrors(prev => ({ ...prev, [name]: err }));
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex mx-auto flex-col gap-4 mt-6" aria-live="polite">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3">
            <FormInput
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              required
            />
            <FormInput
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              required
            />
          </div>

          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email address"
            required
            value={form.email}
            onChange={(v) => handleChange('email', v)}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}

          <FormInput
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            required
            minLength={8}
            value={form.password}
            onChange={(v) => handleChange('password', v)}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}

          <FormInput
            id="confirmpassword"
            name="confirmpassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            required
            minLength={8}
            value={form.confirmpassword}
            onChange={(v) => handleChange('confirmpassword', v)}
          />
          {errors.confirmpassword && <p className="text-sm text-destructive">{errors.confirmpassword}</p>}
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button
          type="submit"
          variant="primary"
          size="normal"
          className="mt-2 w-full"
          disabled={isPending}
        >
          S'inscrire
        </Button>

        {(clientError || errorMessage) && (
          <div className="flex items-center justify-center mt-2 text-center">
            <ExclamationCircleIcon className="h-5 w-5 text-destructive" />
            <p className="ml-2 text-sm text-destructive">{clientError ?? errorMessage}</p>
          </div>
        )}
      </form>

      <div className="flex items-center justify-center text-center mt-8">
        <p className="text-lg text-foreground">
          Déjà un compte ?
          <a href="/login" className="text-primary font-medium ml-2">
            Connectez-vous
          </a>
        </p>
      </div>
    </>
  );
}