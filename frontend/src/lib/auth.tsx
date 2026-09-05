import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Reactive Supabase session for UI affordances (never a security boundary). */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function displayName(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata as { full_name?: string; phone?: string } | undefined;
  return meta?.full_name || meta?.phone || user.email?.split("@")[0] || "";
}

/** Farmers may not have an email address, so a normalised mobile number is
 *  turned into a deterministic internal address for credential storage. */
export function phoneToEmail(phone: string): string {
  return `${phone.replace(/\D/g, "")}@kisan.local`;
}
