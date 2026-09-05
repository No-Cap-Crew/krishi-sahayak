import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/lang";
import { nextBookingId } from "@/lib/data";
import { Header } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({
    meta: [
      { title: "Book a Procurement Slot — Kisan Sahayak" },
      { name: "description", content: "Reserve a date and time to sell your crop at the procurement centre." },
      { property: "og:title", content: "Book a Procurement Slot — Kisan Sahayak" },
      { property: "og:description", content: "Reserve a date and time to sell your crop." },
    ],
  }),
  component: BookPage,
});

const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/70";

function BookPage() {
  const { strings: s } = useLang();
  const [bookedId, setBookedId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  if (bookedId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header s={s} back />
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <CheckCircle2 className="h-20 w-20 text-primary" />
          <h1 className="mt-5 text-2xl font-bold text-foreground">{s.bookingSuccess}</h1>
          <div className="mt-6 w-full max-w-sm rounded-2xl border-2 border-dashed border-primary/40 bg-accent/60 p-6">
            <p className="text-sm font-medium text-muted-foreground">{s.bookingId}</p>
            <p className="mt-1 text-3xl font-bold tracking-wide text-primary">{bookedId}</p>
          </div>
          <p className="mt-5 max-w-xs text-sm text-muted-foreground">{s.bookingNote}</p>
          <Link
            to="/"
            className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-card)] active:scale-[0.98]"
          >
            {s.backHome}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header s={s} back />
      <main className="mx-auto max-w-lg px-5 pb-12 pt-4">
        <h1 className="text-2xl font-bold text-foreground">{s.bookingTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.bookingSub}</p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setBookedId(nextBookingId());
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{s.name}</span>
            <input required className={inputCls} placeholder={s.namePh} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{s.phone}</span>
            <input required className={inputCls} placeholder={s.phonePh} inputMode="numeric" pattern="[0-9]{10}" maxLength={10} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{s.village}</span>
            <input required className={inputCls} placeholder={s.villagePh} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">{s.crop}</span>
              <select required className={inputCls} defaultValue="">
                <option value="" disabled>—</option>
                {s.crops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">{s.quantity}</span>
              <input required type="number" min={1} className={inputCls} placeholder={s.quantityPh} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{s.date}</span>
            <input required type="date" min={today} defaultValue={today} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{s.time}</span>
            <select required className={inputCls} defaultValue="Morning">
              <option value="Morning">{s.morning}</option>
              <option value="Afternoon">{s.afternoon}</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-3 w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
          >
            {s.submit}
          </button>
        </form>
      </main>
    </div>
  );
}
