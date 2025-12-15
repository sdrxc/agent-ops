import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

// 👇 import your SSO provider(s) here
// import AzureADProvider from "next-auth/providers/azure-ad";

// Types for our auth system
export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "viewer";
  password?: string;
};

export type Session = {
  user: Omit<User, "password"> & { sessionId: string };
  expires: string;
};

// Helper: Generate a unique sessionId using user info + timestamp
function generateSessionId(user: { id: string; email: string }): string {
  const raw = `${user.id}-${user.email}-${Date.now()}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Local-only dummy credentials provider
    ...(process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === "local"
      ? [
          CredentialsProvider({
            id: "credentials",
            name: "Local Dummy Login",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "Enter email" },
              password: { label: "Password", type: "password", placeholder: "Enter password" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;

              // ✅ Return dummy user for local dev
              return {
                id: "local-admin-user-id",
                name: "Admin User (Local)",
                email: credentials.email,
                role: "admin",
              };
            },
          }),
        ]
      : []),

    // 👇 Add your real SSO provider(s) here
    // AzureADProvider({ clientId: "...", clientSecret: "...", tenantId: "..." }),
  ],

  session: {
    strategy: "jwt",
    maxAge:
      process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === "local"
        ? 24 * 60 * 60 // 1 day for local
        : 60 * 60, // 1 hour for production
    updateAge:
      process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === "local"
        ? 24 * 60 * 60 // refresh every 1h locally
        : 24 * 30 * 60, // refresh every 30 min in prod
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: (user as any).id,
          name: (user as any).name,
          email: (user as any).email,
          role: (user as any).role,
          sessionId: generateSessionId(user as any), // ✅ hashed sessionId
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.user) {
        session.user = {
          ...session.user,
          ...(token.user as Omit<User, "password"> & { sessionId: string }),
        };
      }
      return session;
    },
  },

  secret:
    process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

import { getServerSession as getNextAuthServerSession } from "next-auth/next";

// ✅ Helper to get current session
export async function getServerSession(): Promise<Session | null> {
  return (await getNextAuthServerSession(authOptions)) as Session | null;
}

// ✅ Helper to get current user
export async function getCurrentUser(): Promise<
  (Omit<User, "password"> & { sessionId: string }) | null
> {
  const session = await getServerSession();
  return session?.user || null;
}
