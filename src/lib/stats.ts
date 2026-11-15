import "server-only";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function publicStats() {
  const [[completed], [active], [rescuers], [reporters]] = await Promise.all([
    db.select({ n: count() }).from(schema.requests).where(eq(schema.requests.status, "completed")),
    db.select({ n: count() }).from(schema.requests).where(eq(schema.requests.status, "assigned")),
    db.select({ n: count() }).from(schema.rescuers).where(eq(schema.rescuers.active, true)),
    db.select({ n: count() }).from(schema.reporters),
  ]);
  return { completed: completed.n, active: active.n, rescuers: rescuers.n, reporters: reporters.n };
}
