"use server";

import { signIn } from '../../../auth';

export async function authenticate(
  formData: FormData,
) {
  try {
    const res = await signIn('credentials', formData);
    if (!res) {
      return 'Invalid credentials.';
    }
    return undefined;
  } catch (error) {
    console.error('authenticate error', error);
    return 'Something went wrong.';
  }
}