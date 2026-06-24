"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function LoginPage() {
  const router = useRouter();
  const { isSupabaseConfigured, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Enter your email and password first.");
      return;
    }

    const error = await signIn(email, password);

    if (error) {
      setMessage(error);
      return;
    }

    router.push("/dashboard");
  }

  async function handleSignUp() {
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Enter your email and password first.");
      return;
    }

    const error = await signUp(email, password);
    setMessage(error ?? "Account created. Check your email if confirmation is enabled.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
      <section className="rounded-2xl bg-white/85 p-5 shadow-soft">
        <p className="text-sm font-semibold text-paw-purple">PayPaw</p>
        <h1 className="mt-1 text-2xl font-bold text-paw-plum">Login</h1>

        {!isSupabaseConfigured ? (
          <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">
            Supabase environment variables are missing.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-paw-plum">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-paw-plum">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-paw-lavender bg-paw-cream px-3 py-3 outline-none focus:border-paw-purple"
              type="password"
              autoComplete="current-password"
              minLength={6}
              required
            />
          </label>

          {message ? (
            <p className="text-sm font-semibold text-paw-plum">{message}</p>
          ) : null}

          <button className="rounded-xl bg-paw-purple px-4 py-3 font-bold text-white">
            Login
          </button>
          <button
            onClick={handleSignUp}
            className="rounded-xl bg-paw-blush px-4 py-3 font-bold text-paw-purple"
            type="button"
          >
            Create Account
          </button>
        </form>
      </section>
    </main>
  );
}
