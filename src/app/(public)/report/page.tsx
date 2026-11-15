import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { ReportForm } from "./report-form";

export const metadata: Metadata = { title: "Report an animal" };

export default async function ReportPage() {
  const { t } = await getT();
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.report.title}</h1>
      <p className="mt-3 text-muted">{t.report.subtitle}</p>
      <div className="mt-8"><ReportForm t={t} /></div>
    </div>
  );
}
