"use client";

import { Check, LocateFixed } from "lucide-react";
import { useState } from "react";

type Labels = { use: string; saved: string; denied: string; remove: string };

export function LocationField({ labels }: { labels: Labels }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);

  function locate() {
    if (!("geolocation" in navigator)) return setDenied(true);
    setBusy(true); setDenied(false);
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }); setBusy(false); },
      () => { setDenied(true); setBusy(false); },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 },
    );
  }

  return (
    <div>
      <input type="hidden" name="lat" value={pos?.lat ?? ""} />
      <input type="hidden" name="lng" value={pos?.lng ?? ""} />
      {pos ? (
        <p className="flex flex-wrap items-center gap-3 rounded-xl bg-success-soft p-3 font-medium text-success" role="status">
          <Check size={18} aria-hidden /> {labels.saved}
          <button type="button" onClick={() => setPos(null)} className="text-sm underline underline-offset-2">{labels.remove}</button>
        </p>
      ) : (
        <button type="button" onClick={locate} disabled={busy} className="btn btn-secondary btn-sm" aria-busy={busy}>
          <LocateFixed size={16} aria-hidden className={busy ? "animate-pulse" : ""} /> {labels.use}
        </button>
      )}
      {denied && <p role="alert" className="field-help mt-2">{labels.denied}</p>}
    </div>
  );
}
