import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, Mail, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail, useSession } from "@/lib/auth";
import { useLang } from "@/lib/lang";
import { Header } from "@/components/PageHeader";
import kisanLogo from "@/assets/kisan-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Farmer Login & Registration — Kisan Sahayak" },
      { name: "description", content: "Login or register with your mobile number or email to book procurement slots and track your produce." },
      { property: "og:title", content: "Farmer Login & Registration — Kisan Sahayak" },
      { property: "og:description", content: "Login or register with your mobile number or email to book procurement slots." },
    ],
  }),
  component: AuthPage,
});

const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/70";

const phoneSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "phone");
const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);

type Mode = "login" | "register";
type Method = "phone" | "email";

function AuthPage() {
  const { strings: s } = useLang();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();

  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [village, setVillage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sessionLoading && session) navigate({ to: "/book", replace: true });
  }, [session, sessionLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const idResult = method === "phone" ? phoneSchema.safeParse(identifier) : emailSchema.safeParse(identifier);
    if (!idResult.success) {
      toast.error(method === "phone" ? s.authBadPhone : s.authBadEmail);
      return;
    }
    if (!passwordSchema.safeParse(password).success) {
      toast.error(s.authBadPassword);
      return;
    }
    if (mode === "register" && fullName.trim().length < 2) {
      toast.error(s.authBadName);
      return;
    }

    const email = method === "phone" ? phoneToEmail(idResult.data) : idResult.data.toLowerCase();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(s.authInvalidCreds);
          return;
        }
        toast.success(s.authSuccessLogin);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName.trim().slice(0, 100),
              village: village.trim().slice(0, 120),
              phone: method === "phone" ? idResult.data : "",
            },
          },
        });
        if (error) {
          toast.error(error.message.toLowerCase().includes("already") ? s.authExists : s.authGenericError);
          return;
        }
        if (!data.session) {
          toast.success(s.authCheckEmail);
          setMode("login");
          return;
        }
        toast.success(s.authSuccessRegister);
      }
      navigate({ to: "/book", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-accent/40">
      <Header s={s} back />
      <main className="mx-auto max-w-md px-5 pb-14 pt-6">
        <div className="flex flex-col items-center text-center">
          <img src={kisanLogo} alt="Kisan Sahayak logo" className="h-14 w-14 object-contain" />
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            {mode === "login" ? s.authTitleLogin : s.authTitleRegister}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? s.authSubLogin : s.authSubRegister}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-card p-1 shadow-sm">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg py-2.5 text-sm font-bold transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {m === "login" ? s.authLogin : s.authRegister}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex gap-2">
            {(["phone", "email"] as const).map((m) => {
              const Icon = m === "phone" ? Phone : Mail;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m);
                    setIdentifier("");
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    method === m
                      ? "border-primary bg-accent text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {m === "phone" ? s.authWithPhone : s.authWithEmail}
                </button>
              );
            })}
          </div>

          {mode === "register" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">{s.name}</span>
                <input
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                  placeholder={s.namePh}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">{s.village}</span>
                <input
                  maxLength={120}
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className={inputCls}
                  placeholder={s.villagePh}
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {method === "phone" ? s.phone : s.email}
            </span>
            <input
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputCls}
              type={method === "phone" ? "tel" : "email"}
              inputMode={method === "phone" ? "numeric" : "email"}
              maxLength={method === "phone" ? 10 : 255}
              placeholder={method === "phone" ? s.phonePh : s.emailPh}
              autoComplete={method === "phone" ? "tel" : "email"}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{s.password}</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder={s.passwordPh}
              minLength={6}
              maxLength={72}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-[var(--shadow-card)] transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {busy ? s.authLoading : mode === "login" ? s.authLogin : s.authRegister}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm font-semibold text-primary underline decoration-saffron decoration-2 underline-offset-4"
          >
            {mode === "login" ? s.authNoAccount : s.authHaveAccount}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/status" className="font-semibold text-primary">
            {s.navStatus}
          </Link>
        </p>
      </main>
    </div>
  );
}
