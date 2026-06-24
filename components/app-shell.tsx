"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/income", label: "Income" },
  { href: "/bills", label: "Bills" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-5 sm:py-8">
      <header className="mb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-paw-purple">PayPaw</p>
            <h1 className="text-2xl font-bold text-paw-plum">tepetumuahmuah</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              aria-label="Settings"
              href="/settings"
              title="Settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-paw-blush text-xl shadow-soft"
            >
              ⚙
            </Link>
            <Link
              aria-label={user ? "Profile" : "Login"}
              href={user ? "/profile" : "/login"}
              title={user ? "Profile" : "Login"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-paw-lavender text-2xl shadow-soft"
            >
              🐾
            </Link>
          </div>
        </div>

        <nav className="grid grid-cols-3 rounded-2xl bg-white/80 p-1 shadow-soft">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-center text-sm font-semibold transition ${
                  isActive
                    ? "bg-paw-purple text-white"
                    : "text-paw-plum hover:bg-paw-blush"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {children}
    </main>
  );
}
