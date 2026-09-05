import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  Truck,
  Bell,
  MapPin,
  Users,
  Wheat,
  Warehouse,
  Timer,
  ArrowRight,
  Phone,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { LangToggle, useLang } from "@/lib/lang";
import { displayName, useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import heroFarmer from "@/assets/hero-farmer.jpg";
import kisanLogo from "@/assets/kisan-logo.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kisan Sahayak — Crop Procurement for Indian Farmers" },
      { name: "description", content: "Book crop procurement slots, track your produce, and receive payments transparently. In English and Hindi." },
      { property: "og:title", content: "Kisan Sahayak — Your Partner in Every Step of Procurement" },
      { property: "og:description", content: "Book crop procurement slots, track your produce, and receive payments transparently." },
    ],
  }),
  component: Index,
});

const featureIcons = [CalendarCheck, Truck, Bell, MapPin] as const;
const featureLinks = ["/auth", "/status", "/status", "/admin"] as const;
const statIcons = [Users, Wheat, Warehouse, Timer];

function Index() {
  const { strings: s } = useLang();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <img src={kisanLogo} alt="Kisan Sahayak logo" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight">
                <span className="text-primary">{s.heroTitleA}</span>{" "}
                <span className="text-saffron">{s.heroTitleB}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Smart · Transparent · Timely</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-foreground md:flex">
            <Link to="/" className="text-primary underline decoration-saffron decoration-2 underline-offset-8">{s.navHome}</Link>
            <Link to="/status" className="hover:text-primary">{s.navStatus}</Link>
            {user && <Link to="/book" className="hover:text-primary">{s.navBook}</Link>}
            <Link to="/admin" className="hover:text-primary">{s.navAdmin}</Link>
          </nav>

          <div className="flex items-center gap-2">
            <LangToggle />
            {user ? (
              <>
                <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-primary sm:inline">
                  {displayName(user) || s.myAccount}
                </span>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-primary px-3 py-2 text-sm font-bold text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.logout}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  {s.authLogin}
                </Link>
                <Link
                  to="/auth"
                  className="hidden items-center gap-1.5 rounded-lg border-2 border-saffron px-3.5 py-2 text-sm font-bold text-saffron sm:inline-flex"
                >
                  <UserPlus className="h-4 w-4" />
                  {s.authRegister}
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-accent/50">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-14">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-primary">{s.heroTitleA}</span>{" "}
              <span className="text-saffron">{s.heroTitleB}</span>
            </h1>
            <p className="mt-3 max-w-md text-xl font-bold leading-snug text-foreground sm:text-2xl">
              {s.heroHeading}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {s.heroSub}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/status"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
              >
                <CalendarCheck className="h-5 w-5" />
                {s.heroCta1}
              </Link>
              <Link
                to={user ? "/book" : "/auth"}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-5 py-3.5 font-bold text-primary transition-transform active:scale-[0.98]"
              >
                {user ? <Users className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {user ? s.heroCta2 : s.authRegister}
              </Link>

            </div>
          </div>
          <div className="relative">
            <img
              src={heroFarmer}
              alt="Indian farmer in a wheat field showing the Kisan Sahayak app on his phone"
              width={1344}
              height={768}
              className="w-full rounded-2xl object-cover shadow-[var(--shadow-card)] md:rounded-3xl"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 rounded-b-2xl bg-gradient-to-r from-primary via-saffron to-primary md:rounded-b-3xl" />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.features.map((f, i) => {
            const Icon = featureIcons[i] ?? CalendarCheck;
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-card)]">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${i % 2 === 0 ? "bg-accent text-primary" : "bg-saffron/15 text-saffron"}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-bold text-foreground">{f.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <Link
                  to={featureLinks[i] ?? "/auth"}
                  className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold ${i % 2 === 0 ? "text-primary" : "text-saffron"}`}
                >
                  {f.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="grid grid-cols-2 gap-y-6 rounded-2xl border border-border bg-card px-4 py-6 shadow-sm sm:grid-cols-4 sm:divide-x sm:divide-border">
          {s.stats.map((st, i) => {
            const Icon = statIcons[i] ?? Users;
            return (
              <div key={st.label} className="flex items-center gap-3 px-2 sm:justify-center">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-saffron text-saffron-foreground"}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-xl font-bold text-foreground">{st.value}</span>
                  <span className="block text-xs font-medium text-muted-foreground">{st.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="max-w-xl text-xs leading-relaxed text-primary-foreground/85">{s.footerRights}</p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            {s.footerLinks.map((l) => (
              <a key={l} href="#" className="hover:underline underline-offset-4">{l}</a>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5">
              <Phone className="h-3.5 w-3.5" />
              14404
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
