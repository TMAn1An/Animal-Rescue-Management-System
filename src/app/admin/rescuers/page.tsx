import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { deleteRescuer } from "@/app/actions/admin";
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/i18n/server";
import { listRescuers } from "@/lib/queries";

export const metadata: Metadata = { title: "Rescuers" };
export const dynamic = "force-dynamic";

export default async function RescuersPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const { t } = await getT();
  const rows = await listRescuers();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{t.admin.rescuersTitle}</h1>
        <Link href="/admin/rescuers/new" className="btn btn-primary"><Plus size={18} aria-hidden />{t.admin.addRescuer}</Link>
      </div>
      {(sp.saved || sp.deleted) && <p role="status" className="rounded-xl bg-success-soft p-3 font-medium text-success">{sp.saved ? t.admin.rescuerSaved : t.admin.rescuerDeleted}</p>}
      <div className="card table-wrap">
        {rows.length === 0 ? <p className="p-10 text-center text-muted">{t.admin.noRescuersYet}</p> : (
          <table className="table">
            <thead><tr><th scope="col">{t.admin.name}</th><th scope="col">{t.admin.phone}</th><th scope="col">{t.admin.area}</th><th scope="col">{t.admin.activeJobs}</th><th scope="col">{t.admin.totalJobs}</th><th scope="col">{t.admin.colStatus}</th><th scope="col"><span className="sr-only">{t.admin.edit}</span></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.name}</td><td>{r.phone}</td><td>{r.area ?? "—"}</td><td>{r.open}</td><td>{r.total}</td>
                  <td><span className={`badge ${r.active ? "badge-completed" : "badge-cancelled"}`}>{r.active ? t.admin.active : t.admin.inactive}</span></td>
                  <td><div className="flex justify-end gap-2">
                    <Link href={`/admin/rescuers/${r.id}`} className="btn btn-secondary btn-sm"><Pencil size={14} aria-hidden />{t.admin.edit}</Link>
                    <form action={deleteRescuer}><input type="hidden" name="id" value={r.id} /><DeleteButton label={t.admin.delete} confirm={t.admin.deleteConfirm} /></form>
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
