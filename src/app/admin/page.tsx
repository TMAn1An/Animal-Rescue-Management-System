import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed, ClipboardList, UserCheck } from "lucide-react";
import { ConditionBadge } from "@/components/badges";
import { PetIcon } from "@/components/pet-icon";
import { getT } from "@/i18n/server";
import { formatNumber, timeAgo } from "@/lib/format";
import { dashboardData } from "@/lib/queries";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const staff = await requireStaff();
  const { t, locale } = await getT();
  const d = await dashboardData();
  const tiles = [
    { label: t.admin.pending, n: d.counts.pending, Icon: CircleDashed, tone: "text-accent bg-accent-soft", href: "/admin/requests?status=pending" },
    { label: t.admin.assigned, n: d.counts.assigned, Icon: UserCheck, tone: "text-info bg-info-soft", href: "/admin/requests?status=assigned" },
    { label: t.admin.completed, n: d.counts.completed, Icon: CircleCheck, tone: "text-success bg-success-soft", href: "/admin/requests?status=completed" },
    { label: t.admin.total, n: d.total, Icon: ClipboardList, tone: "text-primary bg-primary-soft", href: "/admin/requests" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t.admin.dashboardTitle}</h1>
        <p className="text-muted">{t.admin.welcome}, {staff.name}.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, n, Icon, tone, href }) => (
          <Link key={label} href={href} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
            <span className={`grid size-12 place-items-center rounded-xl ${tone}`}><Icon size={22} aria-hidden /></span>
            <span><span className="block text-3xl font-extrabold tabular-nums">{formatNumber(n, locale)}</span><span className="text-sm text-muted">{label}</span></span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3" aria-labelledby="attn">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="attn" className="text-lg font-bold">{t.admin.needsAttention}</h2>
            <Link href="/admin/requests?status=pending" className="text-sm font-semibold text-primary">{t.admin.viewAll}</Link>
          </div>
          {d.attention.length === 0 ? <p className="py-6 text-center text-muted">{t.admin.needsAttentionEmpty}</p> : (
            <ul className="divide-y divide-line">
              {d.attention.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/requests/${r.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-2 -mx-2 px-2 rounded-lg">
                    <span className="grid size-10 place-items-center rounded-lg bg-surface-2 text-primary"><PetIcon type={r.petType} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold">{t.pet[r.petType]} · {r.area}</span><span className="text-sm text-muted">{r.code} · {timeAgo(r.createdAt, locale)}</span></span>
                    <ConditionBadge condition={r.condition} t={t} />
                    <ArrowRight size={16} aria-hidden className="text-muted rtl:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="recent">
          <h2 id="recent" className="mb-4 text-lg font-bold">{t.admin.recent}</h2>
          {d.recent.length === 0 ? <p className="text-muted">{t.admin.noRecent}</p> : (
            <ul className="space-y-4">
              {d.recent.map((e) => (
                <li key={e.id} className="text-sm">
                  <p><span className="font-semibold">{t.event[e.type]}</span> · <Link href={`/admin/requests/${e.requestId}`} className="font-mono text-primary">{e.code}</Link></p>
                  <p className="text-muted">{timeAgo(e.at, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
