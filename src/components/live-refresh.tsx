"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BellRing, X } from "lucide-react";
import type { Pulse } from "@/lib/pulse";

type Labels = { on: string; newRequest: string; view: string; dismiss: string; pet: Record<string, string>; condition: Record<string, string> };

const INTERVAL = 12_000;

/**
 * Polls a tiny endpoint while the tab is visible. When something changed it refreshes
 * the server-rendered page in place and announces brand-new requests.
 */
export function LiveRefresh({ initial, labels }: { initial: Pulse; labels: Labels }) {
  const router = useRouter();
  const last = useRef(initial);
  const [toast, setToast] = useState<Pulse["newest"]>(null);
  const [online, setOnline] = useState(true);

  // The server re-renders the layout after router.refresh(); keep our baseline in sync.
  useEffect(() => { last.current = initial; }, [initial]);

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = initial.pending > 0 ? `(${initial.pending}) ${base}` : base;
  }, [initial.pending]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    async function tick() {
      if (stopped) return;
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch("/api/admin/pulse", { cache: "no-store" });
          if (res.status === 401) { router.refresh(); return; }
          const next: Pulse = await res.json();
          setOnline(true);
          const prev = last.current;
          if (next.newestRequestId > prev.newestRequestId && next.newest) setToast(next.newest);
          if (next.latestEventId !== prev.latestEventId || next.newestRequestId !== prev.newestRequestId || next.pending !== prev.pending) {
            last.current = next;
            router.refresh();
          }
        } catch {
          setOnline(false);
        }
      }
      timer = setTimeout(tick, INTERVAL);
    }
    const onVisible = () => { if (document.visibilityState === "visible") { clearTimeout(timer); tick(); } };
    document.addEventListener("visibilitychange", onVisible);
    timer = setTimeout(tick, INTERVAL);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [router]);

  return (
    <>
      <span className="no-print inline-flex items-center gap-1.5 text-xs font-semibold text-muted" title={labels.on}>
        <span className={`size-2 rounded-full ${online ? "animate-pulse bg-success" : "bg-danger"}`} aria-hidden />
        {labels.on}
      </span>
      {toast && (
        <div role="status" className="no-print fixed bottom-4 end-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-primary bg-surface p-4 shadow-[var(--shadow)]">
          <BellRing size={20} aria-hidden className="mt-0.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{labels.newRequest}</p>
            <p className="text-sm text-muted">{labels.pet[toast.petType]} · {labels.condition[toast.condition]} · {toast.area}</p>
            <Link href={`/admin/requests/${toast.id}`} onClick={() => setToast(null)} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">{labels.view} {toast.code}</Link>
          </div>
          <button type="button" onClick={() => setToast(null)} className="rounded-md p-1 text-muted hover:text-ink" aria-label={labels.dismiss}><X size={16} aria-hidden /></button>
        </div>
      )}
    </>
  );
}
