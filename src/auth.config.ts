import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config used by both the full Auth.js instance (`src/auth.ts`)
 * and `proxy.ts`. Must not import Prisma / bcrypt (Node-only deps).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/login")) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/work", request.nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        return auth?.user?.role === "ADMIN";
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "ADMIN" | "MEMBER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "MEMBER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
