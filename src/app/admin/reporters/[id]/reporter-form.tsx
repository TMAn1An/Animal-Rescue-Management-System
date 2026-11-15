"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveReporter, type ActionResult } from "@/app/actions/admin";
import { fieldErr } from "@/components/action-form";
import { Field, describedBy } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { Dict } from "@/i18n";

export function ReporterForm({ t, initial }: { t: Dict; initial: { id: number; name: string; phone: string } }) {
  const [state, action] = useActionState<ActionResult, FormData>(saveReporter, {});
  const e = (k: string) => fieldErr(t, state.errors, k);
  const p = (k: string) => ({ id: k, name: k, "aria-invalid": e(k) ? true : undefined, "aria-describedby": describedBy(k, false, !!e(k)) });
  return (
    <form action={action} className="card max-w-xl space-y-5 p-6">
      <input type="hidden" name="id" value={initial.id} />
      <Field id="name" label={t.admin.name} required error={e("name")}><input {...p("name")} className="input" required minLength={2} maxLength={100} defaultValue={initial.name} /></Field>
      <Field id="phone" label={t.admin.phone} required error={e("phone")}><input {...p("phone")} className="input" type="tel" inputMode="tel" required defaultValue={initial.phone} /></Field>
      <div className="flex gap-3"><SubmitButton>{t.admin.save}</SubmitButton><Link href="/admin/reporters" className="btn btn-secondary">{t.common.cancel}</Link></div>
    </form>
  );
}
