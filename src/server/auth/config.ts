import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      // Paths are locale-prefixed: /en/dashboard, /ar/login, etc.
      const isOnDashboard = pathname.includes("/dashboard");
      const isOnAuth =
        pathname.includes("/login") || pathname.includes("/register");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        const locale = pathname.split("/")[1] || "en";
        return Response.redirect(new URL(`/${locale}/login`, nextUrl));
      }
      if (isLoggedIn && isOnAuth) {
        const locale = pathname.split("/")[1] || "en";
        return Response.redirect(new URL(`/${locale}/dashboard`, nextUrl));
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Include additional user data in JWT (normalize role to string)
        token.id = user.id;
        token.role = String(user.role ?? "PARENT");
        token.schoolId = user.schoolId;
        token.name = user.name;
        token.email = user.email;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "PARENT";
        session.user.schoolId = token.schoolId as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            schoolId: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) return null;

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as any;
      },
    }),
  ],
};
