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
    console.log('Auth - getUser result:', user[0]);
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
        // user comes from authorize and is the DB row; copy first_name, id, and is_admin if present
        (token as any).first_name = (user as any).first_name ?? (user as any).name?.split(/\s+/)[0];
        (token as any).userId = (user as any).id;
        (token as any).is_admin = (user as any).is_admin ?? false;
        (token as any).is_blocked = (user as any).is_blocked ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      // expose first_name, userId, and is_admin on session.user for easier access in the app
      if (session?.user) {
        (session.user as any).first_name = (token as any).first_name ?? session.user.name?.split(/\s+/)[0];
        (session.user as any).id = (token as any).userId;
        (session.user as any).is_admin = (token as any).is_admin ?? false;
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
      
      // Block user if is_blocked is true
      if (user.is_blocked === true) {
        console.log('Auth - User is blocked:', user.email);
        throw new Error('USER_BLOCKED');
      }
      
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        // Return user with all needed fields explicitly
        const authUser = {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          first_name: user.firstName,
          is_admin: user.is_admin ?? false,
          is_blocked: user.is_blocked ?? false
        };
        console.log('Auth - authorize returning:', authUser);
        return authUser;
      }
    }

    return null;
  },
}),
  ],
});