"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveRescuer, type ActionResult } from "@/app/actions/admin";
import { fieldErr } from "@/components/action-form";
import { Field, describedBy } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { Dict } from "@/i18n";

type Initial = { id?: number; name?: string; phone?: string; nid?: string | null; area?: string | null; active?: boolean };

export function RescuerForm({ t, initial }: { t: Dict; initial?: Initial }) {
  const [state, action] = useActionState<ActionResult, FormData>(saveRescuer, {});
  const e = (k: string) => fieldErr(t, state.errors, k);
  const p = (k: string) => ({ id: k, name: k, "aria-invalid": e(k) ? true : undefined, "aria-describedby": describedBy(k, false, !!e(k)) });
  return (
    <form action={action} className="card max-w-2xl space-y-5 p-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label={t.admin.name} required error={e("name")}><input {...p("name")} className="input" required minLength={2} maxLength={100} defaultValue={initial?.name} /></Field>
        <Field id="phone" label={t.admin.phone} required error={e("phone")}><input {...p("phone")} className="input" type="tel" inputMode="tel" required defaultValue={initial?.phone} /></Field>
        <Field id="nid" label={t.admin.nid} error={e("nid")}><input {...p("nid")} className="input" maxLength={30} defaultValue={initial?.nid ?? ""} /></Field>
        <Field id="area" label={t.admin.area} error={e("area")}><input {...p("area")} className="input" maxLength={60} defaultValue={initial?.area ?? ""} /></Field>
      </div>
      <label className="flex items-center gap-3 font-semibold"><input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="size-5 accent-[var(--primary)]" />{t.admin.active}</label>
      <div className="flex gap-3"><SubmitButton>{t.admin.save}</SubmitButton><Link href="/admin/rescuers" className="btn btn-secondary">{t.common.cancel}</Link></div>
    </form>
  );
}
