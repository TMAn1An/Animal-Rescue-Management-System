"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type PasswordState } from "@/app/actions/auth";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { Dict } from "@/i18n";

export function PasswordForm({ t }: { t: Dict }) {
  const [state, action] = useActionState<PasswordState, FormData>(changePassword, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const error = state.error ? t.account.errors[state.error] : undefined;
  return (
    <form ref={ref} action={action} className="card max-w-xl space-y-5 p-6">
      <h2 className="text-lg font-bold">{t.account.changePassword}</h2>
      <Field id="current" label={t.account.current} required>
        <input id="current" name="current" type="password" className="input" required autoComplete="current-password" />
      </Field>
      <Field id="next" label={t.account.next} required help={t.account.hint}>
        <input id="next" name="next" type="password" className="input" required minLength={10} maxLength={200} autoComplete="new-password" />
      </Field>
      <Field id="confirm" label={t.account.confirm} required>
        <input id="confirm" name="confirm" type="password" className="input" required minLength={10} maxLength={200} autoComplete="new-password" />
      </Field>
      <div aria-live="polite">
        {error && <p role="alert" className="field-error">{error}</p>}
        {state.ok && <p className="font-medium text-success">{t.account.saved}</p>}
      </div>
      <SubmitButton>{t.account.submit}</SubmitButton>
    </form>
  );
}
