"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/lib/types";

interface UserInfo {
  role: UserRole;
  username: string;
  name: string;
}

export function useUserRole(): { userInfo: UserInfo | null; isLoading: boolean } {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user?.role) {
    return { userInfo: null, isLoading: status === "loading" };
  }

  return {
    userInfo: {
      role: session.user.role as UserRole,
      username: session.user.username as string,
      name: session.user.name as string,
    },
    isLoading: false,
  };
}
