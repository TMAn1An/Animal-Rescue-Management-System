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
