"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
    // signIn redirects; if we're still here something went wrong
    setIsLoading(false);
  }

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
      "This email is linked to a different sign-in method.",
    BackendAuthError:
      "Your account is not on the invite list. Please contact an admin.",
    RefreshAccessTokenError: "Your session expired. Please sign in again.",
    default: "Something went wrong. Please try again.",
  };
  const errorMsg = error
    ? (errorMessages[error] ?? errorMessages.default)
    : null;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-sm">
        {/* Logo / brand mark */}
        <div className="mb-stack-lg text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-container mb-stack-md"
            aria-hidden="true"
          >
            <span className="text-2xl font-display font-semibold text-on-primary-container select-none">
              S
            </span>
          </div>
          <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Serene Wellness
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Your invite-only wellness campaign
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-stack-md rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
          >
            {errorMsg}
          </div>
        )}

        {/* Sign-in card */}
        <div className="rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-card p-8">
          <p className="text-body-md text-on-surface-variant mb-stack-md text-center">
            Sign in with your invited Google account to continue.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="w-full gap-3"
            isLoading={isLoading}
            onClick={handleGoogleSignIn}
            aria-label="Sign in with Google"
          >
            {!isLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-5 h-5 shrink-0"
              >
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#fff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#fff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? "Signing in…" : "Continue with Google"}
          </Button>
        </div>

        <p className="mt-stack-md text-center text-label-sm text-on-surface-variant">
          Access is by invitation only.{" "}
          <span className="text-on-surface">
            Contact your campaign administrator
          </span>{" "}
          if you believe you should have access.
        </p>
      </div>
    </main>
  );
}
