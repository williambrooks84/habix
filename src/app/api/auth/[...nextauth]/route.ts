import NextAuth, { AuthOptions, Session, User } from "next-auth";

console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/app/lib/auth-utils";
import sql, { toUserResponse } from "@/app/lib/database";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const result = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;
        if (result.length === 0) return null;
        const user = result[0];
        
        // Block user if is_blocked is true
        if (user.is_blocked === true) {
          console.log('Auth API - User is blocked:', user.email);
          throw new Error('USER_BLOCKED');
        }
        
        const isValid = await verifyPassword(credentials.password, user.password_hash);
        if (!isValid) return null;
        return { ...toUserResponse(user), id: String(user.id) } as User;
      }
    })
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async session({ session, token }) {
      const user = token.user as { email?: string; firstName?: string; lastName?: string };
      session.user = {
        ...session.user,
        email: user?.email,
        name: user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.firstName || user?.email,
      };
      console.log('Session callback:', session);
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };