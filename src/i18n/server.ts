import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, loadDict, type Locale } from "./index";

export const getLocale = cache(async (): Promise<Locale> => {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (c === "bn" || c === "en") return c;
  const accept = (await headers()).get("accept-language") ?? "";
  return /^bn\b|,\s*bn\b/i.test(accept) ? "bn" : "en";
});

export const getT = cache(async () => {
  const locale = await getLocale();
  return { locale, t: await loadDict(locale) };
});
