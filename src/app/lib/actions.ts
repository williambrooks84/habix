"use server";

import { signIn } from '../../../auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // signIn implementation exported from your `auth.ts` should return the
    // authenticated user or null. Handle both outcomes safely here.
    const res = await signIn('credentials', formData);
    if (!res) {
      return 'Invalid credentials.';
    }
    // success: return undefined so the form action knows there's no error
    return undefined;
  } catch (error) {
    // Avoid relying on runtime classes from next-auth. Log and return a
    // generic error message that the UI can display.
    console.error('authenticate error', error);
    return 'Something went wrong.';
  }
}