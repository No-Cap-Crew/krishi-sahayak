import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquareText, Sprout, Users, Wheat, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { demoBookings } from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Kisan Sahayak Procurement" },
      { name: "description", content: "Procurement officer dashboard: today's scheduled farmers, expected crop volumes, and SMS alerts." },
      { property: "og:title", content: "Admin Dashboard — Kisan Sahayak Procurement" },
      { property: "og:description", content: "Today's scheduled farmers, expected crop volumes, and SMS alerts." },
    ],
  }),
  component: AdminPage,
});

const statusStyles: Record<string, string> = {
  Scheduled: "bg-primary/10 text-primary",
  Completed: "bg-chart-2/15 text-chart-2",
  Pending: "bg-chart-4/20 text-chart-3",
};

function AdminPage() {
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const totalQuintals = demoBookings.reduce((sum, b) => sum + b.quantityQuintals, 0);
  const completed = demoBookings.filter((b) => b.status === "Completed").length;

  const sendSms = (id: string, farmer: string) => {
    setSent((p) => ({ ...p, [id]: true }));
    toast.success(`SMS reminder sent to ${farmer}`, {
      description: "Slot confirmation and centre directions delivered.",
    });
  };

  const sendAll = () => {
    const targets = demoBookings.filter((b) => b.status === "Scheduled");
    setSent((p) => {
      const next = { ...p };
      targets.forEach((b) => (next[b.id] = true));
      return next;
    });
    toast.success(`SMS alerts sent to ${targets.length} farmers`, {
      description: "All scheduled farmers for today have been notified.",
    });
  };

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Kisan Sahayak Admin</p>
            <p className="text-xs text-muted-foreground">Procurement Officer Dashboard</p>
          </div>
        </div>
        <Link to="/" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
          Farmer view
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Today's Schedule</h1>
            <p className="text-sm text-muted-foreground">30 August 2026 · Meerut Procurement Centre</p>
          </div>
          <button
            onClick={sendAll}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
          >
            <MessageSquareText className="h-4 w-4" />
            Send SMS to All
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat icon={<Users className="h-5 w-5 text-primary" />} label="Farmers" value={String(demoBookings.length)} />
          <Stat icon={<Wheat className="h-5 w-5 text-primary" />} label="Expected (q)" value={String(totalQuintals)} />
          <Stat icon={<CheckCircle2 className="h-5 w-5 text-primary" />} label="Completed" value={String(completed)} />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Booking ID</th>
                <th className="px-4 py-3 font-semibold">Farmer</th>
                <th className="px-4 py-3 font-semibold">Village</th>
                <th className="px-4 py-3 font-semibold">Crop</th>
                <th className="px-4 py-3 text-right font-semibold">Volume (q)</th>
                <th className="px-4 py-3 font-semibold">Slot</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {demoBookings.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{b.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{b.farmer}</p>
                    <p className="text-xs text-muted-foreground">{b.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.village}</td>
                  <td className="px-4 py-3 text-foreground">{b.crop}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{b.quantityQuintals}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {b.slot}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => sendSms(b.id, b.farmer)}
                      disabled={sent[b.id]}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-card px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-accent disabled:border-border disabled:text-muted-foreground"
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      {sent[b.id] ? "Sent ✓" : "Send SMS"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {icon}
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
