import { createContext, useContext, useState, type ReactNode } from "react";
import { Languages } from "lucide-react";
import type { Lang } from "./i18n";
import { t } from "./i18n";

interface LangCtx {
  lang: Lang;
  strings: ReturnType<typeof t>;
  toggle: () => void;
}

const Ctx = createContext<LangCtx>({ lang: "en", strings: t("en"), toggle: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <Ctx.Provider
      value={{
        lang,
        strings: t(lang),
        toggle: () => setLang((l) => (l === "en" ? "hi" : "en")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLang() {
  return useContext(Ctx);
}

export function LangToggle() {
  const { strings, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-accent"
    >
      <Languages className="h-4 w-4" aria-hidden />
      {strings.langToggle}
    </button>
  );
}
