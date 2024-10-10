// lib/auth.ts

import { NextAuthOptions, User as NextAuthUser, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getServerSession } from "next-auth/next";

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const supabase = createClientComponentClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user || !data.user.email) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || null,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && typeof session.user === 'object') {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            email: token.email as string,
          }
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const getSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
};

export const getUserProfile = async () => {
  const session = await getSession();
  if (session?.user) {
    const supabase = createClientComponentClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    return profile;
  }
  return null;
};