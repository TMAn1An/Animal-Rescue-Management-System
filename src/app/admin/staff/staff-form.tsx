"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStaff, type ActionResult } from "@/app/actions/admin";
import { fieldErr } from "@/components/action-form";
import { Field, describedBy } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { Dict } from "@/i18n";

export function StaffForm({ t }: { t: Dict }) {
  const [state, action] = useActionState<ActionResult, FormData>(createStaff, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const e = (k: string) => fieldErr(t, state.errors, k);
  const p = (k: string, help = false) => ({ id: k, name: k, "aria-invalid": e(k) ? true : undefined, "aria-describedby": describedBy(k, help, !!e(k)) });
  return (
    <form ref={ref} action={action} className="card space-y-5 p-6">
      <h2 className="text-lg font-bold">{t.admin.addStaff}</h2>
      <Field id="name" label={t.admin.staffName} required error={e("name")}><input {...p("name")} className="input" required minLength={2} maxLength={100} autoComplete="off" /></Field>
      <Field id="email" label={t.admin.staffEmail} required error={e("email")}><input {...p("email")} className="input" type="email" required autoComplete="off" /></Field>
      <Field id="password" label={t.admin.staffPassword} required help={t.admin.staffPasswordHelp} error={e("password")}><input {...p("password", true)} className="input" type="password" required minLength={10} maxLength={200} autoComplete="new-password" /></Field>
      {state.ok && <p role="status" className="font-medium text-success">{t.admin.staffAdded}</p>}
      <SubmitButton>{t.admin.add}</SubmitButton>
    </form>
  );
}
