// lib/auth.ts
import { prisma } from "./prisma-node";
import { verifyPassword } from "./password";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  // Use JWT for credentials provider
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            passwordHash: true, // must exist in your schema + DB
          },
        });
        if (!user || !user.passwordHash) return null;

        const ok = await verifyPassword(creds.password, user.passwordHash);
        if (!ok) return null;

        // What gets embedded into the JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role: user.role ?? "USER",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role ?? "USER";
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role ?? "USER";
      return session;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
  },
};

// Helper for server components/layouts
export const auth = () => getServerSession(authOptions);
