import "server-only";
import { count, desc, eq, max } from "drizzle-orm";
import { db, schema } from "@/db";

export type Pulse = {
  pending: number;
  latestEventId: number;
  /** Newest request still waiting for a rescuer, if any. */
  newest: { id: number; code: string; petType: schema.PetType; condition: schema.Condition; area: string } | null;
  newestRequestId: number;
};

/** A tiny snapshot of "what changed" that the admin UI polls to stay live. */
export async function getPulse(): Promise<Pulse> {
  const [[p], [e], [r], newest] = await Promise.all([
    db.select({ n: count() }).from(schema.requests).where(eq(schema.requests.status, "pending")),
    db.select({ m: max(schema.requestEvents.id) }).from(schema.requestEvents),
    db.select({ m: max(schema.requests.id) }).from(schema.requests),
    db.select({ id: schema.requests.id, code: schema.requests.code, petType: schema.requests.petType, condition: schema.requests.condition, area: schema.requests.area })
      .from(schema.requests).orderBy(desc(schema.requests.id)).limit(1),
  ]);
  return { pending: p.n, latestEventId: e.m ?? 0, newestRequestId: r.m ?? 0, newest: newest[0] ?? null };
}
