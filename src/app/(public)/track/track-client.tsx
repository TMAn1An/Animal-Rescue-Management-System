"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Phone, UserRound } from "lucide-react";
import { refreshTrack, trackRequest, type TrackState } from "@/app/actions/public";
import { Field } from "@/components/field";
import { StatusBadge, ConditionBadge } from "@/components/badges";
import { PetIcon } from "@/components/pet-icon";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime } from "@/lib/format";
import type { Dict, Locale } from "@/i18n";

export function TrackClient({ t, locale, initialCode }: { t: Dict; locale: Locale; initialCode: string }) {
  const [state, action] = useActionState<TrackState | null, FormData>(trackRequest, null);
  const [live, setLive] = useState<{ view: Extract<TrackState, { found: true }>["view"]; at: Date } | null>(null);
  const creds = useRef({ code: "", phone: "" });
  const view = live?.view ?? (state?.found ? state.view : null);
  const settled = view?.status === "completed" || view?.status === "cancelled";

  // Poll while the request is still open and the tab is visible.
  useEffect(() => {
    if (!view || settled || !creds.current.phone) return;
    let stopped = false;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await refreshTrack(creds.current.code, creds.current.phone);
        if (!stopped && next.found) setLive({ view: next.view, at: new Date() });
      } catch { /* offline: try again next tick */ }
    };
    const id = setInterval(poll, 20_000);
    const onVisible = () => poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => { stopped = true; clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [view?.code, settled]); // eslint-disable-line react-hooks/exhaustive-deps
  const error = state && !state.found ? (state.error === "tooMany" ? t.errors.tooMany : t.track.notFound) : null;

  return (
    <div className="space-y-8">
      {!view && (
        <form
          action={action} className="card space-y-5 p-6"
          onSubmit={(e) => {
            const fd = new FormData(e.currentTarget);
            creds.current = { code: String(fd.get("code") ?? "").trim().toUpperCase(), phone: String(fd.get("phone") ?? "") };
            setLive(null);
          }}
        >
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
          {!settled && (
            <p className="flex items-center gap-2 text-xs font-semibold text-muted" aria-live="off">
              <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden /> {t.track.live}
              {live && <span className="font-normal">· {t.track.updatedAt} {live.at.toLocaleTimeString(locale === "bn" ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>}
            </p>
          )}
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
