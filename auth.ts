import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      // On first sign in, persist extra fields from the returned user into the token
      if (user) {
        // user comes from authorize and is the DB row; copy first_name if present
        (token as any).first_name = (user as any).first_name ?? (user as any).name?.split(/\s+/)[0];
      }
      return token;
    },
    async session({ session, token }) {
      // expose first_name on session.user for easier access in the app
      if (session?.user) {
        (session.user as any).first_name = (token as any).first_name ?? session.user.name?.split(/\s+/)[0];
      }
      return session;
    },
  },
  providers: [
Credentials({
  credentials: {
    email: { label: "Email", type: "email", required: true },
    password: { label: "Password", type: "password", required: true },
  },
  async authorize(credentials) {
    const parsedCredentials = z
      .object({ email: z.email(), password: z.string().min(6) })
      .safeParse(credentials);

    if (parsedCredentials.success) {
      const { email, password } = parsedCredentials.data;
      const user = await getUser(email);
      if (!user) return null;
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) return user;
    }

    return null;
  },
}),
  ],
});