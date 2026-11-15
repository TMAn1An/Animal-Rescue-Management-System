import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Phone, Printer } from "lucide-react";
import { addNote, assignRescuer, completeRequest, deleteRequest, moveRequest } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { DeleteButton } from "@/components/delete-button";
import { ConditionBadge, StatusBadge } from "@/components/badges";
import { Field } from "@/components/field";
import { PetIcon } from "@/components/pet-icon";
import { SubmitButton } from "@/components/submit-button";
import { db, schema } from "@/db";
import { getT } from "@/i18n/server";
import { formatDateTime, formatMoney, toDhakaLocalInput } from "@/lib/format";
import { getRequestDetail } from "@/lib/queries";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Request" };
export const dynamic = "force-dynamic";

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const r = await getRequestDetail(id);
  if (!r) notFound();
  const { t, locale } = await getT();
  const rescuers = await db.select().from(schema.rescuers).where(eq(schema.rescuers.active, true)).orderBy(schema.rescuers.name);
  const events = [...r.events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id);
  const minEta = toDhakaLocalInput(new Date());
  const canAssign = r.status === "pending" || r.status === "assigned";

  const Move = ({ move, label, danger, confirm }: { move: string; label: string; danger?: boolean; confirm?: string }) => (
    <ActionForm action={moveRequest} t={t} confirm={confirm}>
      <input type="hidden" name="id" value={r.id} /><input type="hidden" name="move" value={move} />
      <SubmitButton className={`btn btn-sm ${danger ? "btn-danger" : "btn-secondary"}`}>{label}</SubmitButton>
    </ActionForm>
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/requests" className="no-print inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden className="rtl:rotate-180" />{t.nav.requests}</Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-3"><span className="font-mono text-3xl font-extrabold tracking-widest text-primary">{r.code}</span><StatusBadge status={r.status} t={t} /></p>
          <p className="mt-1 flex items-center gap-2 text-muted"><PetIcon type={r.petType} />{t.pet[r.petType]} <ConditionBadge condition={r.condition} t={t} /> · {formatDateTime(r.createdAt, locale)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/requests/${r.id}/print?type=slip`} className="btn btn-secondary btn-sm"><Printer size={15} aria-hidden />{t.admin.printSlip}</Link>
          {r.rescuer && <Link href={`/admin/requests/${r.id}/print?type=receipt`} className="btn btn-secondary btn-sm"><FileText size={15} aria-hidden />{t.admin.printReceipt}</Link>}
          <Link href={`/track?code=${r.code}`} className="btn btn-secondary btn-sm" target="_blank"><ExternalLink size={15} aria-hidden />{t.admin.publicLink}</Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="card p-6" aria-labelledby="details">
            <h2 id="details" className="mb-4 text-lg font-bold">{t.admin.details}</h2>
            <dl className="grid gap-4 sm:grid-cols-2 [&_dt]:text-xs [&_dt]:font-semibold [&_dt]:uppercase [&_dt]:tracking-wide [&_dt]:text-muted [&_dd]:mt-0.5">
              <div><dt>{t.admin.reporter}</dt><dd>{r.reporter.name}<a href={`tel:${r.reporter.phone}`} className="mt-0.5 flex items-center gap-1.5 text-primary"><Phone size={14} aria-hidden />{r.reporter.phone}</a></dd></div>
              <div><dt>{t.admin.location}</dt><dd>{r.area}<span className="block text-muted">{r.address}</span></dd></div>
              <div className="sm:col-span-2"><dt>{t.report.description}</dt><dd className="whitespace-pre-line">{r.description}</dd></div>
              {r.note && <div className="sm:col-span-2"><dt>{t.admin.noteLabel}</dt><dd className="whitespace-pre-line">{r.note}</dd></div>}
              <div><dt>{t.admin.donation}</dt><dd>{formatMoney(r.donationAmount, locale)}</dd></div>
              {r.rescuer && <div><dt>{t.track.rescuer}</dt><dd>{r.rescuer.name}<span className="block text-muted">{r.rescuer.phone}</span></dd></div>}
              {r.eta && r.status === "assigned" && <div><dt>{t.admin.eta}</dt><dd>{formatDateTime(r.eta, locale)}</dd></div>}
              {r.outcome && <div className="sm:col-span-2"><dt>{t.admin.outcome}</dt><dd className="whitespace-pre-line">{r.outcome}</dd></div>}
            </dl>
          </section>

          <section className="card p-6" aria-labelledby="tl">
            <h2 id="tl" className="mb-4 text-lg font-bold">{t.admin.timeline}</h2>
            <ol className="space-y-4 border-s-2 border-line ps-5">
              {events.map((e) => (
                <li key={e.id} className="relative before:absolute before:-start-[1.72rem] before:top-2 before:size-2.5 before:rounded-full before:bg-primary">
                  <p className="font-semibold">{t.event[e.type]}{e.actor && <span className="font-normal text-muted"> · {e.actor.name}</span>}</p>
                  {e.message && <p className="text-muted">{e.message}</p>}
                  <time className="text-sm text-muted" dateTime={e.createdAt.toISOString()}>{formatDateTime(e.createdAt, locale)}</time>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="no-print space-y-6 lg:col-span-2">
          {canAssign && (
            <section className="card p-6" aria-labelledby="assign">
              <h2 id="assign" className="mb-4 text-lg font-bold">{r.status === "assigned" ? t.admin.reassign : t.admin.assign}</h2>
              {rescuers.length === 0 ? <p className="text-muted">{t.admin.noRescuers} <Link className="font-semibold text-primary" href="/admin/rescuers/new">{t.admin.addRescuer}</Link></p> : (
                <ActionForm action={assignRescuer} t={t} className="space-y-4" successMessage={t.admin.updated}>
                  <input type="hidden" name="id" value={r.id} />
                  <Field id="rescuerId" label={t.admin.chooseRescuer} required>
                    <select id="rescuerId" name="rescuerId" className="input" required defaultValue={r.rescuerId ?? ""}>
                      <option value="" disabled>—</option>
                      {rescuers.map((s) => <option key={s.id} value={s.id}>{s.name}{s.area ? ` · ${s.area}` : ""}</option>)}
                    </select>
                  </Field>
                  <Field id="eta" label={t.admin.eta} required>
                    <input id="eta" name="eta" type="datetime-local" className="input" required min={minEta} />
                  </Field>
                  <SubmitButton>{t.admin.assignBtn}</SubmitButton>
                </ActionForm>
              )}
            </section>
          )}

          {r.status === "assigned" && (
            <section className="card p-6" aria-labelledby="complete">
              <h2 id="complete" className="mb-4 text-lg font-bold">{t.admin.complete}</h2>
              <ActionForm action={completeRequest} t={t} className="space-y-4">
                <input type="hidden" name="id" value={r.id} />
                <Field id="outcome" label={t.admin.outcome} required>
                  <textarea id="outcome" name="outcome" className="input" required minLength={3} maxLength={2000} placeholder={t.admin.outcomePh} />
                </Field>
                <SubmitButton>{t.admin.completeBtn}</SubmitButton>
              </ActionForm>
            </section>
          )}

          <section className="card p-6" aria-labelledby="note">
            <h2 id="note" className="mb-4 text-lg font-bold">{t.admin.addNote}</h2>
            <ActionForm action={addNote} t={t} className="space-y-3" resetOnSuccess>
              <input type="hidden" name="id" value={r.id} />
              <textarea name="message" aria-label={t.admin.addNote} className="input !min-h-20" required minLength={2} maxLength={500} placeholder={t.admin.notePh} />
              <SubmitButton className="btn btn-secondary btn-sm">{t.admin.addNoteBtn}</SubmitButton>
            </ActionForm>
          </section>

          <section className="card flex flex-wrap gap-2 p-6">
            {r.status === "assigned" && <Move move="unassign" label={t.admin.unassign} />}
            {(r.status === "completed" || r.status === "cancelled") && <Move move="reopen" label={t.admin.reopen} />}
            {(r.status === "pending" || r.status === "assigned") && <Move move="cancel" label={t.admin.cancel} danger confirm={t.admin.cancelConfirm} />}
            <form action={deleteRequest}>
              <input type="hidden" name="id" value={r.id} />
              <DeleteButton label={t.admin.delete} confirm={t.admin.deleteConfirm} />
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
