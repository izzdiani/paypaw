"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";

export function ProfilePage() {
  const router = useRouter();
  const { isSupabaseConfigured, signOut, user } = useAuth();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <AppShell>
      <section className="rounded-2xl bg-white/85 p-5 shadow-soft">
        <p className="text-sm font-semibold text-paw-purple">Account</p>
        <h2 className="mt-1 text-2xl font-bold text-paw-plum">Profile</h2>

        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl bg-paw-cream p-4">
            <p className="text-xs font-bold uppercase text-paw-purple">Email</p>
            <p className="mt-1 break-words text-base font-semibold text-paw-plum">
              {user?.email ?? "Not logged in"}
            </p>
          </div>

          <div className="rounded-2xl bg-paw-cream p-4">
            <p className="text-xs font-bold uppercase text-paw-purple">Sync</p>
            <p className="mt-1 text-sm font-semibold text-paw-plum">
              {user
                ? "Cloud sync is active."
                : isSupabaseConfigured
                  ? "Login to sync across devices."
                  : "Local storage only."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-100 px-4 py-3 font-bold text-red-700"
              type="button"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-paw-purple px-4 py-3 text-center font-bold text-white"
            >
              Login
            </Link>
          )}
        </div>
      </section>
    </AppShell>
  );
}
