import type { UserRole } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email?: string | null;
      image?: string | null;
      username?: string;
      role: UserRole;
      isAdmin: boolean;
      onboardingComplete: boolean;
    };
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
    role?: UserRole;
    isAdmin?: boolean;
    onboardingComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: UserRole;
    isAdmin?: boolean;
    onboardingComplete?: boolean;
    phoneNumber?: string;
  }
}
