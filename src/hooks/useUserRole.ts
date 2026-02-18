"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/lib/types";

interface UserInfo {
  role: UserRole;
  username: string;
  name: string;
}

export function useUserRole(): UserInfo | null {
  const { data: session } = useSession();

  if (!session?.user?.role) return null;

  return {
    role: session.user.role as UserRole,
    username: session.user.username as string,
    name: session.user.name as string,
  };
}
