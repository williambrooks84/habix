'use client';

import { useRouter } from 'next/navigation';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useActionState, useState, startTransition } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import FormInput from './form-input';

export default function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [errorMessage, , isPending] = useActionState(authenticate, undefined);
    const [clientError, setClientError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setClientError(null);

        const fd = new FormData(e.currentTarget);


        if (!validateFormData(fd)) {
            setClientError('Please check the highlighted fields and correct any errors.');
            return;
        }

        const payload = Object.fromEntries(fd.entries());
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.status === 409) {
            const result = await res.json();
            setClientError(result.error || 'Email already used.');
            return;
        }
        if (!res.ok) {
            const result = await res.json().catch(() => ({}));
            setClientError(result.error || 'Signup failed.');
            return;
        }
        // Success
        router.push('/login');
    }

    function verifyEmailFormat(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isPasswordMatching(password: string, confirmPassword: string) {
        if (password !== confirmPassword) {
            return false;
        }
        return true;
    }

    function isPasswordStrong(password: string) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    }

    function validateFormData(formData: FormData) {
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmpassword') as string;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return false;
        }

        if (!verifyEmailFormat(email)) {
            return false;
        }
        if (!isPasswordStrong(password)) {
            return false;
        }
        if (!isPasswordMatching(password, confirmPassword)) {
            return false;
        }
        return true;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <h1 className="mb-3 text-2xl">Please sign up to continue.</h1>

                <div className="w-full">
                    <div>
                        <FormInput
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            type="text"
                            placeholder="Enter your first name"
                            required
                            icon={<AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
                        />
                        <FormInput
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            type="text"
                            placeholder="Enter your last name"
                            required
                            icon={<AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
                        />
                    </div>
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
                            minLength={6}
                            icon={<KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
                        />
                    </div>
                    <div className="mt-4">
                        <FormInput
                            id="confirmpassword"
                            name="confirmpassword"
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm password"
                            required
                            minLength={6}
                            icon={<KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
                        />
                    </div>
                </div>

                <input type="hidden" name="redirectTo" value={callbackUrl} />

                <Button type="submit" className="mt-4 w-full" aria-disabled={isPending}>
                    Sign up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                </Button>

                <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                    {(clientError || errorMessage) && (
                        <>
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-500">{clientError ?? errorMessage}</p>
                        </>
                    )}
                </div>
            </div>
        </form>
    );
}