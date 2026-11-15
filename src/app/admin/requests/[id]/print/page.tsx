import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getRequestDetail } from "@/lib/queries";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Print" };
export const dynamic = "force-dynamic";

export default async function PrintPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
  const id = Number((await params).id);
  const { type } = await searchParams;
  const r = Number.isInteger(id) ? await getRequestDetail(id) : null;
  if (!r) notFound();
  const { t, locale } = await getT();
  const isReceipt = type === "receipt" && r.rescuer;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const rows: [string, string][] = [
    [t.admin.colCode, r.code],
    [t.admin.colAnimal, `${t.pet[r.petType]} (${t.condition[r.condition]})`],
    [t.admin.location, `${r.area}, ${r.address}`],
    ...(isReceipt
      ? ([
          [t.admin.reporter, `${r.reporter.name} · ${r.reporter.phone}`],
          [t.report.description, r.description],
          [t.admin.donation, formatMoney(r.donationAmount, locale)],
        ] as [string, string][])
      : ([
          [t.track.rescuer, r.rescuer ? `${r.rescuer.name} · ${r.rescuer.phone}` : "—"],
          [t.admin.eta, r.eta ? formatDateTime(r.eta, locale) : "—"],
          [t.admin.colStatus, t.status[r.status]],
        ] as [string, string][])),
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="no-print mb-4 flex justify-end"><PrintButton label={t.admin.print} /></div>
      <article className="card space-y-5 p-8">
        <header className="flex items-center gap-3 border-b border-line pb-4">
          <Image src="/icon.svg" alt="" width={44} height={44} />
          <div><p className="text-lg font-extrabold">{t.brand}</p><p className="text-sm text-muted">{isReceipt ? t.admin.printReceipt : t.admin.printSlip}</p></div>
        </header>
        <dl className="space-y-3">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-3 border-b border-dashed border-line pb-3"><dt className="text-sm font-semibold text-muted">{k}</dt><dd className="col-span-2 whitespace-pre-line">{v}</dd></div>
          ))}
        </dl>
        {!isReceipt && <p className="text-sm text-muted">{t.track.subtitle} {site && <strong>{site.replace(/^https?:\/\//, "")}/track</strong>}</p>}
        {isReceipt && <div className="grid grid-cols-2 gap-8 pt-10 text-center text-sm text-muted"><p className="border-t border-ink pt-2">{t.track.rescuer}</p><p className="border-t border-ink pt-2">{t.admin.reporter}</p></div>}
        <footer className="text-xs text-muted">{formatDateTime(new Date(), locale)}</footer>
      </article>
    </div>
  );
}
