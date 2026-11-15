"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";

type Labels = { choose: string; remove: string; bad: string };

const MAX_SIDE = 960;

/** Loads an image file, scales it down and re-encodes as JPEG so uploads stay small. */
async function toJpegDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#fff"; // flatten transparency
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const q of [0.78, 0.65, 0.5, 0.38]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= 380_000) return url;
  }
  throw new Error("too large");
}

export function PhotoField({ labels, help, initialError }: { labels: Labels; help: string; initialError?: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | undefined>(initialError);
  const input = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className="field-label" id="photo-label">{labels.choose}</span>
      <input type="hidden" name="photo" value={url} />
      {url ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-56 rounded-xl border border-line" />
          <button type="button" onClick={() => { setUrl(""); if (input.current) input.current.value = ""; }} className="btn btn-secondary btn-sm absolute end-2 top-2 !min-h-9 !px-2" aria-label={labels.remove}>
            <X size={16} aria-hidden />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line bg-surface p-4 text-muted transition hover:border-primary hover:text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]">
          <Camera size={22} aria-hidden className="text-primary" />
          <span className="font-semibold">{labels.choose}</span>
          <input
            ref={input} type="file" accept="image/*" aria-labelledby="photo-label" className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { setUrl(await toJpegDataUrl(file)); setError(undefined); } catch { setError(labels.bad); if (input.current) input.current.value = ""; }
            }}
          />
        </label>
      )}
      {error ? <p role="alert" className="field-error">{error}</p> : <p className="field-help">{help}</p>}
    </div>
  );
}
