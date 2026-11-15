import en from "./en";

type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Widen<U>[] : T extends object ? { -readonly [K in keyof T]: Widen<T[K]> } : T;
export type Dict = Widen<typeof en>;
export type Locale = "en" | "bn";
export const LOCALES: Locale[] = ["en", "bn"];
export const LOCALE_COOKIE = "ar_locale";
export const LOCALE_LABEL: Record<Locale, string> = { en: "English", bn: "বাংলা" };

export async function loadDict(locale: Locale): Promise<Dict> {
  return locale === "bn" ? (await import("./bn")).default : en;
}
