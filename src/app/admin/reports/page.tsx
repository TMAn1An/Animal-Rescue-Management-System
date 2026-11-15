import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { formatMoney, formatNumber } from "@/lib/format";
import { analytics } from "@/lib/queries";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

function Bars({ title, data, label, tone = "bg-primary" }: { title: string; data: { key: string; n: number }[]; label: (k: string) => string; tone?: string }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <section className="card p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.key}>
            <div className="mb-1 flex justify-between text-sm"><span>{label(d.key)}</span><span className="font-semibold tabular-nums">{d.n}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2" role="presentation"><div className={`h-full rounded-full ${tone}`} style={{ width: `${(d.n / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ReportsPage() {
  const { t, locale } = await getT();
  const a = await analytics(30);
  const hrs = (n: number | null) => (n == null ? t.admin.notEnough : `${formatNumber(n, locale, 1)} ${t.admin.hours}`);
  const kpis = [
    [t.admin.total, formatNumber(a.total, locale)],
    [t.admin.completionRate, a.completionRate == null ? t.admin.notEnough : `${formatNumber(a.completionRate * 100, locale)}%`],
    [t.admin.avgResponse, hrs(a.avgAssignHours)], [t.admin.avgRescue, hrs(a.avgCompleteHours)], [t.admin.donations, formatMoney(a.donations, locale)],
  ];
  const maxDay = Math.max(1, ...a.perDay.map((d) => d.n));
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-extrabold tracking-tight">{t.admin.reportsTitle}</h1><p className="text-muted">{t.admin.range}</p></div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map(([k, v]) => (<div key={k} className="card p-5"><dd className="text-2xl font-extrabold tabular-nums text-primary">{v}</dd><dt className="mt-1 text-sm text-muted">{k}</dt></div>))}
      </dl>
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold">{t.admin.perDay}</h2>
        <div className="flex h-40 items-end gap-1" role="img" aria-label={`${t.admin.perDay}: ${a.perDay.map((d) => d.n).join(", ")}`}>
          {a.perDay.map((d) => (
            <div key={d.day} title={`${d.day}: ${d.n}`} className="min-h-0.5 flex-1 rounded-t bg-primary/80 hover:bg-primary" style={{ height: `${(d.n / maxDay) * 100}%` }} />
          ))}
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <Bars title={t.admin.byStatus} data={a.byStatus} label={(k) => t.status[k as keyof typeof t.status]} />
        <Bars title={t.admin.byCondition} data={a.byCondition} label={(k) => t.condition[k as keyof typeof t.condition]} tone="bg-accent" />
        <Bars title={t.admin.byPet} data={a.byPet} label={(k) => t.pet[k as keyof typeof t.pet]} />
        <Bars title={t.admin.byArea} data={a.topAreas} label={(k) => k} tone="bg-info" />
      </div>
    </div>
  );
}
