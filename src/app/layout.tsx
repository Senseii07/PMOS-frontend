import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Serene Wellness",
    template: "%s · Serene Wellness",
  },
  description:
    "An invite-only wellness campaign for managing your health, one day at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-on-surface font-body antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#fff8f6",
                color: "#201a19",
                border: "1px solid #d8c1bf",
                borderRadius: "0.5rem",
                fontFamily: "Manrope, system-ui, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
