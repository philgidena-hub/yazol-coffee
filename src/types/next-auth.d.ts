import type { UserRole } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    name: string;
    username: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    role: UserRole;
  }
}
