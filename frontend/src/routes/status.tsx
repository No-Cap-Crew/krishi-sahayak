import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, CalendarDays, Wheat, IndianRupee } from "lucide-react";
import { useLang } from "@/lib/lang";
import { findBooking, type Booking } from "@/lib/data";
import { Header } from "@/components/PageHeader";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Check Booking Status — Kisan Sahayak" },
      { name: "description", content: "Track your procurement booking and payment status." },
      { property: "og:title", content: "Check Booking Status — Kisan Sahayak" },
      { property: "og:description", content: "Track your procurement booking and payment status." },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { strings: s } = useLang();
  const [result, setResult] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header s={s} back />
      <main className="mx-auto max-w-lg px-5 pb-12 pt-4">
        <h1 className="text-2xl font-bold text-foreground">{s.statusTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.statusSub}</p>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setResult(findBooking(String(fd.get("q") ?? "")) ?? null);
            setSearched(true);
          }}
        >
          <input
            name="q"
            required
            placeholder={s.searchPh}
            className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-base shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-[var(--shadow-card)] active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            {s.search}
          </button>
        </form>

        {searched && !result && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {s.statusNotFound}
          </p>
        )}

        {result && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary-foreground/75">{s.bookingId}</p>
                <p className="text-xl font-bold">{result.id}</p>
              </div>
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">
                {s.statusLabels[result.status]}
              </span>
            </div>
            <dl className="divide-y divide-border px-5">
              <Row label={s.farmer} value={`${result.farmer} · ${result.village}`} icon={<Search className="hidden" />} hideIcon />
              <Row label={s.scheduledFor} value={`${result.date} · ${result.slot}`} icon={<CalendarDays className="h-4 w-4 text-primary" />} />
              <Row label={s.crop} value={`${result.crop} — ${result.quantityQuintals} q`} icon={<Wheat className="h-4 w-4 text-primary" />} />
              <Row
                label={s.payment}
                value={result.paid ? s.paid : s.unpaid}
                icon={<IndianRupee className="h-4 w-4 text-primary" />}
                valueClass={result.paid ? "text-primary" : "text-destructive"}
              />
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  hideIcon,
  valueClass,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  hideIcon?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      {!hideIcon && icon}
      <dt className="w-28 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-sm font-semibold ${valueClass ?? "text-foreground"}`}>{value}</dd>
    </div>
  );
}
