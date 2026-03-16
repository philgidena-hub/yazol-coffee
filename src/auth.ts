import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByUsername, createUser } from "./lib/admin-db";
import { getCustomerByEmail, getOrCreateCustomerByPhone } from "./lib/customer-db";
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

// ── Build providers list dynamically ──────────────────────────
const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

if (process.env.EMAIL_SERVER) {
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "Yazol Coffee <noreply@yazolcoffee.com>",
    })
  );
}

providers.push(
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
          onboardingComplete: true,
        };
      },
    })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Credentials (admin) — already validated in authorize()
      if (account?.provider === "credentials") return true;

      // Google / Email — create customer if first time
      const email = user.email;
      if (!email) return false;

      // If Google/Email OAuth is used in the future, auto-register via phone flow
      // For now, just allow sign-in — customer record is created at checkout
      const existing = await getCustomerByEmail(email);
      if (!existing) {
        // No customer record yet — will be created when they place their first order
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // On initial sign-in, populate token
      if (user && account) {
        if (account.provider === "credentials") {
          // Admin user
          token.username = (user as Record<string, unknown>).username as string;
          token.role = (user as Record<string, unknown>).role as UserRole;
          token.isAdmin = true;
          token.onboardingComplete = true;
        } else {
          // Customer (Google / Email)
          const email = user.email!;
          const customer = await getCustomerByEmail(email);
          token.role = "customer" as UserRole;
          token.isAdmin = false;
          token.onboardingComplete = customer?.onboardingComplete ?? false;
          token.phoneNumber = customer?.phoneNumber;
        }
      }

      // Re-check onboarding status when session is updated
      if (trigger === "update" && token.email && !token.isAdmin) {
        const customer = await getCustomerByEmail(token.email as string);
        token.onboardingComplete = customer?.onboardingComplete ?? false;
        token.phoneNumber = customer?.phoneNumber;
        if (customer?.name) token.name = customer.name;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.name = token.name!;
      session.user.role = (token.role as UserRole) ?? "customer";
      session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      session.user.onboardingComplete =
        (token.onboardingComplete as boolean) ?? false;
      if (token.username) {
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
