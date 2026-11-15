"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionResult } from "@/app/actions/admin";
import type { Dict } from "@/i18n";

type Props = {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  t: Dict;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
  successMessage?: string;
};

/** Wraps an admin server action with consistent error/success feedback. */
export function ActionForm({ action, t, children, className, resetOnSuccess, confirm, successMessage }: Props) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);

  const msg = state.error ? (t.admin as Record<string, string>)[state.error] ?? t.common.error : null;
  return (
    <form
      ref={ref} action={formAction} className={className}
      onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}
    >
      {children}
      <div aria-live="polite">
        {msg && <p role="alert" className="field-error mt-2">{msg}</p>}
        {state.ok && successMessage && <p className="mt-2 text-sm font-medium text-success">{successMessage}</p>}
      </div>
    </form>
  );
}

export const fieldErr = (t: Dict, errors: Record<string, string | undefined> | undefined, k: string) =>
  errors?.[k] ? t.errors[errors[k] as keyof Dict["errors"]] : undefined;
