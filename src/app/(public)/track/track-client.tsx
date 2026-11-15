"use client";

import { useActionState } from "react";
import { CheckCircle2, Clock, Phone, UserRound } from "lucide-react";
import { trackRequest, type TrackState } from "@/app/actions/public";
import { Field } from "@/components/field";
import { StatusBadge, ConditionBadge } from "@/components/badges";
import { PetIcon } from "@/components/pet-icon";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime } from "@/lib/format";
import type { Dict, Locale } from "@/i18n";

export function TrackClient({ t, locale, initialCode }: { t: Dict; locale: Locale; initialCode: string }) {
  const [state, action] = useActionState<TrackState | null, FormData>(trackRequest, null);
  const view = state?.found ? state.view : null;
  const error = state && !state.found ? (state.error === "tooMany" ? t.errors.tooMany : t.track.notFound) : null;

  return (
    <div className="space-y-8">
      {!view && (
        <form action={action} className="card space-y-5 p-6">
          <Field id="code" label={t.track.code} required>
            <input id="code" name="code" className="input font-mono uppercase tracking-widest" required defaultValue={(state && !state.found && state.code) || initialCode} placeholder={t.track.codePh} maxLength={9} autoCapitalize="characters" autoComplete="off" spellCheck={false} />
          </Field>
          <Field id="phone" label={t.track.phone} required>
            <input id="phone" name="phone" className="input" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
          </Field>
          {error && <p role="alert" className="field-error">{error}</p>}
          <SubmitButton className="btn btn-primary w-full sm:w-auto">{t.track.submit}</SubmitButton>
        </form>
      )}

      {view && (
        <article className="card space-y-6 p-6 sm:p-8" aria-live="polite">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-2xl font-extrabold tracking-widest text-primary">{view.code}</p>
              <p className="mt-1 flex items-center gap-2 text-muted">
                <PetIcon type={view.petType} /> {t.pet[view.petType]} · {view.area} · {t.track.reportedOn} {formatDateTime(new Date(view.createdAt), locale)}
              </p>
            </div>
            <div className="flex gap-2"><StatusBadge status={view.status} t={t} /><ConditionBadge condition={view.condition} t={t} /></div>
          </header>

          {view.status === "pending" && <p className="rounded-xl bg-accent-soft p-4 text-accent">{t.track.pendingNote}</p>}

          {view.rescuer && (
            <div className="grid gap-3 rounded-xl bg-surface-2 p-4 sm:grid-cols-2">
              <p className="flex items-center gap-2"><UserRound size={18} aria-hidden className="text-primary" /><span><span className="block text-xs text-muted">{t.track.rescuer}</span><strong>{view.rescuer.name}</strong></span></p>
              <p className="flex items-center gap-2"><Phone size={18} aria-hidden className="text-primary" /><a href={`tel:${view.rescuer.phone}`} className="font-semibold underline-offset-2 hover:underline">{view.rescuer.phone}</a></p>
              {view.eta && view.status === "assigned" && (
                <p className="flex items-center gap-2 sm:col-span-2"><Clock size={18} aria-hidden className="text-primary" /><span><span className="block text-xs text-muted">{t.track.eta}</span><strong>{formatDateTime(new Date(view.eta), locale)}</strong></span></p>
              )}
            </div>
          )}

          {view.outcome && (
            <div className="rounded-xl bg-success-soft p-4 text-success"><p className="text-xs font-semibold uppercase tracking-wide">{t.track.outcome}</p><p className="mt-1 whitespace-pre-line">{view.outcome}</p></div>
          )}

          <section>
            <h2 className="mb-4 text-lg font-bold">{t.track.timeline}</h2>
            <ol className="relative space-y-5 border-s-2 border-line ps-6">
              {view.events.map((e, i) => (
                <li key={i} className="relative">
                  <CheckCircle2 size={20} aria-hidden className="absolute -start-[2.1rem] top-0 rounded-full bg-surface text-primary" />
                  <p className="font-semibold">{t.event[e.type]}</p>
                  {e.message && <p className="text-muted">{e.message}</p>}
                  <time className="text-sm text-muted" dateTime={e.at}>{formatDateTime(new Date(e.at), locale)}</time>
                </li>
              ))}
            </ol>
          </section>
          <a href="/track" className="btn btn-secondary btn-sm">{t.track.back}</a>
        </article>
      )}
    </div>
  );
}
