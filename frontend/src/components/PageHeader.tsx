import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LangToggle, useLang } from "@/lib/lang";

export function Header({ s, back = false }: { s: ReturnType<typeof useLang>["strings"]; back?: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 pt-5">
      {back ? (
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          {s.backHome}
        </Link>
      ) : (
        <span />
      )}
      <LangToggle />
    </header>
  );
}
