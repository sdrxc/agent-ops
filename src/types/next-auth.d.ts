import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      sessionId?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
      sessionId?: string;
    };
    role?: string;
    accessToken?: string;
  }
}
