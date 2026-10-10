/**
 * Augment next-auth types so TypeScript knows about our custom session fields.
 */
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id?: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      full_name?: string;
      picture?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    backendUser?: unknown;
    error?: string;
  }
}
