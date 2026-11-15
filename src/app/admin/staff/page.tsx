import type { Metadata } from "next";
import { deleteStaff } from "@/app/actions/admin";
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { listStaff } from "@/lib/queries";
import { requireStaff } from "@/lib/session";
import { StaffForm } from "./staff-form";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ removed?: string; error?: string }> }) {
  const me = await requireStaff();
  const sp = await searchParams;
  const { t, locale } = await getT();
  const rows = await listStaff();
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-extrabold tracking-tight">{t.admin.teamTitle}</h1><p className="text-muted">{t.admin.teamIntro}</p></div>
      {sp.removed && <p role="status" className="rounded-xl bg-success-soft p-3 font-medium text-success">{t.admin.staffRemoved}</p>}
      {sp.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 font-medium text-danger">{t.admin.cannotRemoveSelf} / {t.admin.cannotRemoveLast}</p>}
      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="card table-wrap lg:col-span-3">
          <table className="table">
            <thead><tr><th scope="col">{t.admin.staffName}</th><th scope="col">{t.admin.staffEmail}</th><th scope="col">{t.admin.joined}</th><th scope="col"><span className="sr-only">{t.admin.removeStaff}</span></th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.name} {s.id === me.id && <span className="badge badge-assigned ms-1">{t.admin.you}</span>}</td>
                  <td>{s.email}</td><td className="text-muted">{formatDate(s.createdAt, locale)}</td>
                  <td>{s.id !== me.id && rows.length > 1 && <form action={deleteStaff} className="flex justify-end"><input type="hidden" name="id" value={s.id} /><DeleteButton label={t.admin.removeStaff} confirm={t.admin.deleteConfirm} /></form>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:col-span-2"><StaffForm t={t} /></div>
      </div>
    </div>
  );
}
