"use client";

import { useActionState } from "react";
import { submitReport, type ReportState } from "@/app/actions/public";
import { Field, describedBy } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { PhotoField } from "@/components/photo-field";
import { LocationField } from "@/components/location-field";
import { PET_TYPES, CONDITIONS } from "@/db/schema";
import { DHAKA_AREAS } from "@/lib/areas";
import type { Dict } from "@/i18n";

export function ReportForm({ t }: { t: Dict }) {
  const [state, action] = useActionState<ReportState, FormData>(submitReport, {});
  const v = state.values ?? {};
  const err = (k: string) => (state.errors?.[k] ? t.errors[state.errors[k] as keyof Dict["errors"]] : undefined);
  const formError = state.formError ? (state.formError === "tooMany" ? t.errors.tooMany : t.common.error) : undefined;

  const common = (id: string, help = false) => ({
    id, name: id, "aria-invalid": err(id) ? true : undefined, "aria-describedby": describedBy(id, help, !!err(id)),
  });

  return (
    <form action={action} className="space-y-8" noValidate={false}>
      {formError && <p role="alert" className="card border-danger bg-danger-soft p-4 font-medium text-danger">{formError}</p>}

      <fieldset className="card space-y-5 p-6">
        <legend className="float-left mb-4 w-full text-lg font-bold">{t.report.yourDetails}</legend>
        <div className="grid clear-both gap-5 sm:grid-cols-2">
          <Field id="name" label={t.report.name} required error={err("name")}>
            <input {...common("name")} className="input" required minLength={2} maxLength={100} autoComplete="name" defaultValue={v.name} placeholder={t.report.namePh} />
          </Field>
          <Field id="phone" label={t.report.phone} required help={t.report.phoneHelp} error={err("phone")}>
            <input {...common("phone", true)} className="input" required type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} placeholder={t.report.phonePh} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="card space-y-5 p-6">
        <legend className="float-left mb-4 w-full text-lg font-bold">{t.report.animalDetails}</legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <Field id="petType" label={t.report.petType} required error={err("petType")}>
            <select {...common("petType")} className="input" required defaultValue={v.petType ?? ""}>
              <option value="" disabled>—</option>
              {PET_TYPES.map((p) => <option key={p} value={p}>{t.pet[p]}</option>)}
            </select>
          </Field>
          <div>
            <span className="field-label" id="condition-label">{t.report.condition} <span aria-hidden className="text-danger">*</span></span>
            <div role="radiogroup" aria-labelledby="condition-label" className="grid gap-2">
              {CONDITIONS.map((c) => (
                <label key={c} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                  <input type="radio" name="condition" value={c} required defaultChecked={v.condition === c} className="mt-1 size-4 accent-[var(--primary)]" />
                  <span><span className="block font-semibold">{t.condition[c]}</span><span className="text-sm text-muted">{t.report.conditionHelp[c]}</span></span>
                </label>
              ))}
            </div>
            {err("condition") && <p role="alert" className="field-error">{err("condition")}</p>}
          </div>
        </div>
        <Field id="description" label={t.report.description} required error={err("description")}>
          <textarea {...common("description")} className="input" required minLength={10} maxLength={2000} defaultValue={v.description} placeholder={t.report.descriptionPh} />
        </Field>
        <PhotoField labels={{ choose: t.report.photo, remove: t.report.photoRemove, bad: t.report.photoBad }} help={t.report.photoHelp} initialError={err("photo")} />
        <Field id="note" label={t.report.note} error={err("note")}>
          <textarea {...common("note")} className="input !min-h-20" maxLength={1000} defaultValue={v.note} placeholder={t.report.notePh} />
        </Field>
      </fieldset>

      <fieldset className="card space-y-5 p-6">
        <legend className="float-left mb-4 w-full text-lg font-bold">{t.report.whereTitle}</legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <Field id="area" label={t.report.area} required error={err("area")}>
            <select {...common("area")} className="input" required defaultValue={v.area ?? ""}>
              <option value="" disabled>{t.report.areaPh}</option>
              {DHAKA_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field id="address" label={t.report.address} required error={err("address")}>
            <input {...common("address")} className="input" required minLength={3} maxLength={255} autoComplete="street-address" defaultValue={v.address} placeholder={t.report.addressPh} />
          </Field>
        </div>
        <LocationField labels={{ use: t.report.useLocation, saved: t.report.locationSaved, denied: t.report.locationDenied, remove: t.report.locationRemove }} />
        <Field id="donation" label={t.report.donation} help={t.report.donationHelp} error={err("donation")} className="sm:max-w-sm">
          <input {...common("donation", true)} className="input" type="number" inputMode="decimal" min={0} max={1000000} step="any" defaultValue={v.donation} />
        </Field>
      </fieldset>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>{t.report.honeypot}<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <SubmitButton pendingLabel={t.report.submitting} className="btn btn-primary w-full text-base sm:w-auto">{t.report.submit}</SubmitButton>
    </form>
  );
}
