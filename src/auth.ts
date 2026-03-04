import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials v Auth.js v5 vyžaduje JWT strategii
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(raw) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(raw);

        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            status: true,
          },
        });

        if (!user?.passwordHash) return null;
        if (user.status === "DISABLED") return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // při loginu máme user
      if (user?.id) token.sub = user.id;

      // při každém requestu si dotáhneme segment ze DB
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { customerType: true, status: true },
        });
        if (dbUser) {
          (token as any).customerType = dbUser.customerType;
          (token as any).status = dbUser.status;
        }
      }

      return token;
    },

    async session({ session, token }) {
      (session as any).userId = token.sub;
      (session as any).customerType = (token as any).customerType;
      (session as any).status = (token as any).status;
      return session;
    },
  },
});