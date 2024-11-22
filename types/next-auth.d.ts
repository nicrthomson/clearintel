import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: number;
    organization_id: number | null;
    role: string;
  }

  interface Session {
    user: {
      id: number;
      organization_id: number | null;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    organization_id: number | null;
    role: string;
  }
}
