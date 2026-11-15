import { Languages } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { LOCALE_LABEL, type Locale } from "@/i18n";

export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const other: Locale = locale === "en" ? "bn" : "en";
  return (
    <form action={setLocale}>
      <input type="hidden" name="locale" value={other} />
      <button type="submit" className="nav-link" aria-label={`${label}: ${LOCALE_LABEL[other]}`} lang={other}>
        <Languages size={16} aria-hidden className="me-1.5" />
        {LOCALE_LABEL[other]}
      </button>
    </form>
  );
}
