import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByUsername, createUser } from "./lib/admin-db";
import type { UserRole } from "./lib/types";

// ── Seed default super_admin on first admin login ─────────────
let seeded = false;
async function ensureDefaultSuperAdmin(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const existing = await getUserByUsername(username);
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    username,
    passwordHash,
    role: "super_admin",
    name: "Super Admin",
  });
  console.log(`[auth] Default super_admin "${username}" created`);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        await ensureDefaultSuperAdmin();

        const user = await getUserByUsername(username);
        if (!user || !user.active) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.username,
          name: user.name,
          email: `${user.username}@admin.yazolcoffee.com`,
          username: user.username,
          role: user.role,
          isAdmin: true,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.username = (user as Record<string, unknown>).username as string;
        token.role = (user as Record<string, unknown>).role as UserRole;
        token.isAdmin = true;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.name = token.name!;
      session.user.role = (token.role as UserRole) ?? "customer";
      session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      if (token.username) {
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
