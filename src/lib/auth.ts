/**
 * NextAuth configuration.
 *
 * Flow:
 *  1. User clicks "Sign in with Google" — NextAuth performs the OAuth dance.
 *  2. On sign-in, we exchange the Google ID token for a backend JWT pair via
 *     POST /api/auth/google/. The backend verifies the token, checks the
 *     allow-list, and returns { access, refresh }.
 *  3. We store access + refresh + expiry on the NextAuth JWT so every
 *     server component / API route can call the Django backend authenticated.
 *  4. The JWT is refreshed automatically before expiry using the refresh token.
 */
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Shape returned by POST /api/auth/google/ */
interface BackendTokens {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    picture: string;
    role: string;
  };
}

async function exchangeGoogleToken(idToken: string): Promise<BackendTokens> {
  const res = await fetch(`${API_URL}/api/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend auth failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<BackendTokens>;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = (await res.json()) as { access: string };
    return {
      ...token,
      accessToken: data.access,
      // Expire 55 minutes from now (access token TTL is 1 h)
      accessTokenExpires: Date.now() + 55 * 60 * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, user: _user }) {
      // Initial sign-in — exchange the Google ID token with our backend
      if (account?.id_token) {
        try {
          const backend = await exchangeGoogleToken(account.id_token);
          return {
            ...token,
            accessToken: backend.access,
            refreshToken: backend.refresh,
            accessTokenExpires: Date.now() + 55 * 60 * 1000,
            backendUser: backend.user,
            error: undefined,
          };
        } catch (err) {
          return { ...token, error: "BackendAuthError" };
        }
      }

      // Token still valid — return as-is
      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Access token expired — refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        accessToken: token.accessToken as string,
        error: token.error as string | undefined,
        user: {
          ...session.user,
          ...(token.backendUser as object),
        },
      };
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },
};
