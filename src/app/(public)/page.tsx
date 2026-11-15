import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Send, Siren } from "lucide-react";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format";
import { publicStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { t, locale } = await getT();
  const s = await publicStats().catch(() => ({ completed: 0, active: 0, rescuers: 0, reporters: 0 }));
  const stats = [
    [t.home.statsRescued, s.completed], [t.home.statsActive, s.active],
    [t.home.statsRescuers, s.rescuers], [t.home.statsReporters, s.reporters],
  ] as const;
  const stepIcons = [Send, Siren, Search];

  return (
    <>
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
            <MapPin size={14} aria-hidden /> {t.home.eyebrow}
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{t.home.title}</h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-muted">{t.home.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/report" className="btn btn-primary text-base">{t.home.cta} <ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link>
            <Link href="/track" className="btn btn-secondary text-base">{t.home.ctaTrack}</Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Siren size={15} aria-hidden className="text-danger" />{t.home.emergency}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow)]">
          <Image src="/hero.jpg" alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="container-page" aria-label="Impact">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([label, n]) => (
            <div key={label} className="card p-5">
              <dd className="text-3xl font-extrabold text-primary tabular-nums">{formatNumber(n, locale)}</dd>
              <dt className="mt-1 text-sm text-muted">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page mt-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.home.howTitle}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {t.home.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <li key={step.t} className="card p-6">
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={22} aria-hidden /></span>
                <h3 className="text-lg font-bold">{i + 1}. {step.t}</h3>
                <p className="mt-1.5 text-muted">{step.d}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="container-page mt-20">
        <div className="card flex flex-col items-start gap-4 bg-primary-soft p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">{t.home.areaTitle}</h2>
            <p className="mt-1 max-w-2xl text-muted">{t.home.areaBody}</p>
          </div>
          <Link href="/report" className="btn btn-primary shrink-0">{t.nav.report}</Link>
        </div>
      </section>
    </>
  );
}
