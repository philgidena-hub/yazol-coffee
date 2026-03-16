"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function adminLogin(username: string, password: string) {
  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" };
    }
    // NextAuth throws a NEXT_REDIRECT "error" on successful redirect — rethrow it
    throw error;
  }
}
