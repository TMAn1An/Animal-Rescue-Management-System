"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { Dict } from "@/i18n";

export function LoginForm({ t }: { t: Dict }) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  const error = state.error === "tooMany" ? t.login.tooMany : state.error ? t.login.invalid : undefined;
  return (
    <form action={action} className="card space-y-5 p-6">
      <Field id="email" label={t.login.email} required>
        <input id="email" name="email" type="email" className="input" required autoComplete="username" defaultValue={state.email} />
      </Field>
      <Field id="password" label={t.login.password} required>
        <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
      </Field>
      {error && <p role="alert" className="field-error">{error}</p>}
      <SubmitButton className="btn btn-primary w-full">{t.login.submit}</SubmitButton>
    </form>
  );
}
