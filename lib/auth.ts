/* lib/auth.ts */
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (!user) return null;

        // Password hash stored by your seed in SQLite side-table _Credential (userId -> passwordHash)
        const row: { passwordHash: string }[] = await prisma.$queryRawUnsafe(
          `SELECT passwordHash FROM _Credential WHERE userId = ? LIMIT 1`,
          user.id
        );
        const hash = row?.[0]?.passwordHash;
        if (!hash) return null;

        const ok = await bcrypt.compare(creds.password, hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          // role column is a string in your Prisma schema
          role: (user as any).role ?? "USER",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).role = (user as any).role ?? "USER";
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = (token as any).role ?? "USER";
      return session;
    },
  },
};
