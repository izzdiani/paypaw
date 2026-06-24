"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase-client";

type User = {
  id: string;
  email?: string;
};

type AuthContextValue = {
  isReady: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<string | null>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getSupabase().then((supabase) => {
      if (!supabase) {
        setIsReady(true);
        return;
      }

      supabase.auth.getSession().then(({ data }: any) => {
        setUser(data.session?.user ?? null);
        setIsReady(true);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setUser(session?.user ?? null);
      });

      unsubscribe = () => listener.subscription.unsubscribe();
    });

    return () => {
      unsubscribe?.();
      setIsReady(true);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isReady,
    isSupabaseConfigured,
    user,
    async signIn(email, password) {
      const supabase = await getSupabase();

      if (!supabase) {
        return "Supabase is not configured yet.";
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    async signUp(email, password) {
      const supabase = await getSupabase();

      if (!supabase) {
        return "Supabase is not configured yet.";
      }

      const { error } = await supabase.auth.signUp({ email, password });
      return error?.message ?? null;
    },
    async signOut() {
      const supabase = await getSupabase();

      await supabase?.auth.signOut();
    }
  }), [isReady, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
