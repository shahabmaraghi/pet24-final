import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect, resetMongoCache } from "@/lib/db";
import User from "@/lib/models/User";

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "admin@pet24.ir").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { id: "admin", name: "مدیر Pet24", email: ADMIN_EMAIL, role: "admin" as const };
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email });
          if (!user?.password) return null;
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role === "admin" ? "admin" : "user",
          };
        } catch {
          await resetMongoCache();
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id || "admin";
        token.email = user.email;
        token.role = (user as { role?: "user" | "admin" }).role || "user";
      }
      if (String(token.email || "").toLowerCase() === ADMIN_EMAIL) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role === "admin" ? "admin" : "user";
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
