import type { Locale } from "@/i18n";

const TZ = "Asia/Dhaka";
const intlLocale = (l: Locale) => (l === "bn" ? "bn-BD" : "en-GB");

export function formatDateTime(d: Date | null | undefined, locale: Locale): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(d);
}

export function formatDate(d: Date | null | undefined, locale: Locale): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeZone: TZ }).format(d);
}

export function formatNumber(n: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: digits }).format(n);
}

export function formatMoney(n: number | null | undefined, locale: Locale): string {
  return n == null ? "—" : `৳${formatNumber(n, locale, 2)}`;
}

export function timeAgo(d: Date, locale: Locale, now = Date.now()): string {
  const diff = d.getTime() - now;
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto" });
  const mins = Math.round(diff / 60_000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 48) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

/** Parses a <input type="datetime-local"> value as Dhaka local time (UTC+6, no DST). */
export function parseDhakaLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+06:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formats a date for the `min` attribute of a datetime-local input, in Dhaka time. */
export function toDhakaLocalInput(d: Date): string {
  const p = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, dateStyle: "short", timeStyle: "short" }).format(d);
  return p.replace(" ", "T");
}
