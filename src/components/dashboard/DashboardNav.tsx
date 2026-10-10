"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  Salad,
  ActivitySquare,
  Droplets,
  Scale,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface NavProps {
  user: Session["user"];
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/meals", label: "Meals", icon: Salad },
  { href: "/dashboard/symptoms", label: "Symptoms", icon: ActivitySquare },
  { href: "/dashboard/water", label: "Water", icon: Droplets },
  { href: "/dashboard/weight", label: "Weight", icon: Scale },
  { href: "/dashboard/assistant", label: "Assistant", icon: Sparkles },
];

export function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const avatarSrc = user.picture ?? user.image ?? undefined;
  const displayName = user.full_name ?? user.name ?? user.email ?? "User";

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-outline-variant/30">
        <span className="font-display text-headline-md text-on-surface">
          Serene
        </span>
      </div>

      {/* Links */}
      <nav aria-label="Dashboard navigation" className="flex-1 py-4 px-3">
        <ul role="list" className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-label-md transition-colors",
                    active
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / sign-out */}
      <div className="border-t border-outline-variant/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-label-sm text-on-secondary-container font-semibold"
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-label-md text-on-surface truncate">
              {displayName}
            </p>
            <p className="text-label-sm text-on-surface-variant capitalize">
              {user.role ?? "participant"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-label-md text-on-surface-variant hover:text-error transition-colors w-full"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-margin-mobile py-3 border-b border-outline-variant/30 bg-surface-container-lowest">
        <span className="font-display text-headline-md text-on-surface">
          Serene
        </span>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="p-1 rounded text-on-surface-variant"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden fixed inset-0 z-40 bg-surface-container-lowest flex flex-col"
        >
          {navContent}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 shrink-0 border-r border-outline-variant/30 bg-surface-container-lowest min-h-screen sticky top-0 h-screen overflow-y-auto">
        {navContent}
      </aside>

      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-on-primary text-label-md"
      >
        Skip to content
      </a>
    </>
  );
}
