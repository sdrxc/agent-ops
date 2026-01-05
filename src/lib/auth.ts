import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

// NextAuth v5 configuration
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    // ✅ Local-only dummy credentials provider
    ...(process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === "local"
      ? [
          Credentials({
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
                email: credentials.email as string,
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

  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
});

// ✅ Helper to get current session (v5 compatible)
export async function getServerSession(): Promise<Session | null> {
  const session = await auth();
  return session as Session | null;
}

// ✅ Helper to get current user
export async function getCurrentUser(): Promise<
  (Omit<User, "password"> & { sessionId: string }) | null
> {
  const session = await getServerSession();
  return session?.user || null;
}
