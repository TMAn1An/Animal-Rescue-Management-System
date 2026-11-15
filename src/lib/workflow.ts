import type { Condition, Status } from "@/db/schema";

/** Allowed status transitions. Completed and cancelled requests can be reopened by staff. */
const TRANSITIONS: Record<Status, Status[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["completed", "pending", "cancelled"],
  completed: ["assigned"],
  cancelled: ["pending"],
};

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from].includes(to);
}

const CONDITION_WEIGHT: Record<Condition, number> = { serious: 3, moderate: 2, normal: 1 };

/** Triage: serious cases first, then oldest first. */
export function compareByUrgency(
  a: { condition: Condition; createdAt: Date },
  b: { condition: Condition; createdAt: Date },
): number {
  const diff = CONDITION_WEIGHT[b.condition] - CONDITION_WEIGHT[a.condition];
  return diff !== 0 ? diff : a.createdAt.getTime() - b.createdAt.getTime();
}

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I to avoid misreading over the phone

/** Generates a short, hard-to-guess public tracking code like AR-7K2M9Q. */
export function generateTrackingCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `AR-${out}`;
}

export const TRACKING_CODE_RE = /^AR-[2-9A-HJ-NP-Z]{6}$/;

/** How long a still-pending request may wait before staff should be nudged, by severity. */
const SLA_MINUTES: Record<Condition, number> = { serious: 30, moderate: 120, normal: 24 * 60 };

export function isOverdue(
  r: { status: Status; condition: Condition; createdAt: Date },
  now: number = Date.now(),
): boolean {
  return r.status === "pending" && now - r.createdAt.getTime() > SLA_MINUTES[r.condition] * 60_000;
}

/** Bangladesh bounding box: rejects obviously bogus coordinates from the client. */
export function validCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 20.5 && lat <= 26.7 && lng >= 88 && lng <= 92.7;
}

/** A JPEG data URL produced by our in-browser resizer: right prefix, JPEG magic bytes, bounded size. */
export function validPhotoDataUrl(v: string, maxChars = 400_000): boolean {
  if (v.length > maxChars || !v.startsWith("data:image/jpeg;base64,")) return false;
  const b64 = v.slice("data:image/jpeg;base64,".length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return false;
  const head = atob(b64.slice(0, 8));
  return head.charCodeAt(0) === 0xff && head.charCodeAt(1) === 0xd8 && head.charCodeAt(2) === 0xff;
}
