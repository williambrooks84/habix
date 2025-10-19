import type { NextAuthOptions } from 'next-auth';

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [], // add providers here (your 'auth.ts' registers providers)
};