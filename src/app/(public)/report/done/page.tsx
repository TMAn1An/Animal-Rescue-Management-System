import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { getT } from "@/i18n/server";
import { TRACKING_CODE_RE } from "@/lib/workflow";
import { redirect } from "next/navigation";
import { CopyButton } from "./copy-button";

export const metadata: Metadata = { title: "Report received", robots: { index: false } };

export default async function DonePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  if (!code || !TRACKING_CODE_RE.test(code)) redirect("/report");
  const { t } = await getT();
  return (
    <div className="container-page max-w-xl py-14 text-center">
      <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success-soft text-success"><CircleCheck size={34} aria-hidden /></span>
      <h1 className="text-3xl font-extrabold tracking-tight">{t.success.title}</h1>
      <p className="mt-3 text-muted">{t.success.body}</p>
      <div className="card mt-8 p-6">
        <p className="text-sm font-semibold text-muted">{t.success.code}</p>
        <p className="mt-1 select-all font-mono text-4xl font-extrabold tracking-widest text-primary">{code}</p>
        <div className="mt-4"><CopyButton text={code} label={t.success.copy} doneLabel={t.success.copied} /></div>
        <p className="mt-4 text-sm text-muted">{t.success.smsHint}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/track?code=${code}`} className="btn btn-primary">{t.success.track}</Link>
        <Link href="/report" className="btn btn-secondary">{t.success.another}</Link>
      </div>
    </div>
  );
}
