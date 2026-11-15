import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ConditionBadge, StatusBadge } from "@/components/badges";
import { PetIcon } from "@/components/pet-icon";
import { CONDITIONS, STATUSES } from "@/db/schema";
import { getT } from "@/i18n/server";
import { formatDateTime } from "@/lib/format";
import { listRequests } from "@/lib/queries";

export const metadata: Metadata = { title: "Requests" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; condition?: string; page?: string };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t, locale } = await getT();
  const { rows, total, page, pages } = await listRequests({ ...sp, page: Number(sp.page) || 1 });
  const hasFilter = !!(sp.q || sp.status || sp.condition);
  const href = (p: number) => {
    const u = new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `/admin/requests?${u}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold tracking-tight">{t.nav.requests}</h1><p className="text-muted">{total} {t.admin.resultCount}</p></div>
      </div>

      <form className="card grid gap-3 p-4 sm:grid-cols-[1fr_10rem_10rem_auto]" role="search">
        <div className="relative">
          <Search size={16} aria-hidden className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} className="input ps-9" placeholder={t.admin.search} aria-label={t.admin.search} type="search" />
        </div>
        <select name="status" defaultValue={sp.status ?? ""} className="input" aria-label={t.admin.filterStatus}>
          <option value="">{t.admin.filterStatus}: {t.admin.all}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
        </select>
        <select name="condition" defaultValue={sp.condition ?? ""} className="input" aria-label={t.admin.filterCondition}>
          <option value="">{t.admin.filterCondition}: {t.admin.all}</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{t.condition[c]}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn btn-primary" aria-label={t.admin.search}><Search size={18} aria-hidden /></button>
          {hasFilter && <Link href="/admin/requests" className="btn btn-secondary">{t.admin.clear}</Link>}
        </div>
      </form>

      <div className="card table-wrap">
        {rows.length === 0 ? <p className="p-10 text-center text-muted">{t.admin.noResults}</p> : (
          <table className="table">
            <thead><tr>
              <th scope="col">{t.admin.colCode}</th><th scope="col">{t.admin.colAnimal}</th><th scope="col">{t.admin.colArea}</th>
              <th scope="col">{t.admin.colReporter}</th><th scope="col">{t.admin.colStatus}</th><th scope="col">{t.admin.colRescuer}</th><th scope="col">{t.admin.colCreated}</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/requests/${r.id}`} className="font-mono font-semibold text-primary hover:underline">{r.code}</Link></td>
                  <td><span className="flex items-center gap-2"><PetIcon type={r.petType} size={16} />{t.pet[r.petType]} <ConditionBadge condition={r.condition} t={t} /></span></td>
                  <td>{r.area}</td>
                  <td>{r.reporterName}<span className="block text-xs text-muted">{r.reporterPhone}</span></td>
                  <td><StatusBadge status={r.status} t={t} /></td>
                  <td>{r.rescuerName ?? "—"}</td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 ? <Link href={href(page - 1)} className="btn btn-secondary btn-sm" rel="prev"><ChevronLeft size={16} aria-hidden className="rtl:rotate-180" /></Link> : <span />}
          <span className="text-sm text-muted">{page} / {pages}</span>
          {page < pages ? <Link href={href(page + 1)} className="btn btn-secondary btn-sm" rel="next"><ChevronRight size={16} aria-hidden className="rtl:rotate-180" /></Link> : <span />}
        </nav>
      )}
    </div>
  );
}
