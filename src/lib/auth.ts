import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByUsername, createUser } from "./admin-db";
import type { UserRole } from "./types";

/**
 * Ensure the default super_admin exists.
 * Uses ADMIN_USERNAME / ADMIN_PASSWORD env vars.
 * Called lazily on the first auth attempt.
 */
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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Seed the default super_admin on first login attempt
        await ensureDefaultSuperAdmin();

        const user = await getUserByUsername(credentials.username);
        if (!user || !user.active) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.username,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role as UserRole;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub!,
        name: token.name!,
        username: token.username,
        role: token.role ?? "cashier",
      };
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
