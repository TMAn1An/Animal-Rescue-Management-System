import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { deleteReporter } from "@/app/actions/admin";
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { listReporters } from "@/lib/queries";

export const metadata: Metadata = { title: "Reporters" };
export const dynamic = "force-dynamic";

export default async function ReportersPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const { t, locale } = await getT();
  const rows = await listReporters();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.admin.reportersTitle}</h1>
      {(sp.saved || sp.deleted) && <p role="status" className="rounded-xl bg-success-soft p-3 font-medium text-success">{sp.saved ? t.admin.reporterSaved : t.admin.reporterDeleted}</p>}
      <div className="card table-wrap">
        {rows.length === 0 ? <p className="p-10 text-center text-muted">{t.admin.noReporters}</p> : (
          <table className="table">
            <thead><tr><th scope="col">{t.admin.name}</th><th scope="col">{t.admin.phone}</th><th scope="col">{t.admin.requestsCount}</th><th scope="col">{t.admin.firstSeen}</th><th scope="col"><span className="sr-only">{t.admin.edit}</span></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.name}</td><td>{r.phone}</td>
                  <td><Link href={`/admin/requests?q=${r.phone}`} className="font-semibold text-primary hover:underline">{r.n}</Link></td>
                  <td className="text-muted">{formatDate(r.createdAt, locale)}</td>
                  <td><div className="flex justify-end gap-2">
                    <Link href={`/admin/reporters/${r.id}`} className="btn btn-secondary btn-sm"><Pencil size={14} aria-hidden />{t.admin.edit}</Link>
                    <form action={deleteReporter}><input type="hidden" name="id" value={r.id} /><DeleteButton label={t.admin.delete} confirm={t.admin.deleteConfirm} /></form>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
