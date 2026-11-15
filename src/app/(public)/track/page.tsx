import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { TRACKING_CODE_RE } from "@/lib/workflow";
import { TrackClient } from "./track-client";

export const metadata: Metadata = { title: "Track a request", robots: { index: false } };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { t, locale } = await getT();
  const { code } = await searchParams;
  const initialCode = code && TRACKING_CODE_RE.test(code.toUpperCase()) ? code.toUpperCase() : "";
  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.track.title}</h1>
      <p className="mt-3 text-muted">{t.track.subtitle}</p>
      <div className="mt-8"><TrackClient t={t} locale={locale} initialCode={initialCode} /></div>
    </div>
  );
}
