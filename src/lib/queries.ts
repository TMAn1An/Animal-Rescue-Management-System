import "server-only";
import { and, count, desc, eq, gte, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { CONDITIONS, STATUSES, type Condition, type Status } from "@/db/schema";
import { compareByUrgency } from "./workflow";

const { requests, reporters, rescuers, requestEvents } = schema;
export const PAGE_SIZE = 15;

export type RequestFilters = { q?: string; status?: string; condition?: string; page?: number };

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

function buildWhere(f: RequestFilters): SQL | undefined {
  const parts: (SQL | undefined)[] = [];
  if (f.status && (STATUSES as readonly string[]).includes(f.status)) parts.push(eq(requests.status, f.status as Status));
  if (f.condition && (CONDITIONS as readonly string[]).includes(f.condition)) parts.push(eq(requests.condition, f.condition as Condition));
  const q = f.q?.trim();
  if (q) {
    const p = `%${escapeLike(q)}%`;
    parts.push(or(
      sql`${requests.code} like ${p} escape '\\'`, sql`${reporters.phone} like ${p} escape '\\'`, sql`${reporters.name} like ${p} escape '\\'`,
      sql`${requests.area} like ${p} escape '\\'`, sql`${requests.address} like ${p} escape '\\'`,
    ));
  }
  return and(...parts);
}

export async function listRequests(f: RequestFilters) {
  const where = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);
  const base = db.select({ n: count() }).from(requests).innerJoin(reporters, eq(requests.reporterId, reporters.id)).where(where);
  const [{ n: total }] = await base;
  const rows = await db
    .select({
      id: requests.id, code: requests.code, petType: requests.petType, condition: requests.condition, status: requests.status,
      area: requests.area, createdAt: requests.createdAt, reporterName: reporters.name, reporterPhone: reporters.phone, rescuerName: rescuers.name,
    })
    .from(requests)
    .innerJoin(reporters, eq(requests.reporterId, reporters.id))
    .leftJoin(rescuers, eq(requests.rescuerId, rescuers.id))
    .where(where)
    .orderBy(desc(requests.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getRequestDetail(id: number) {
  return db.query.requests.findFirst({
    where: eq(requests.id, id),
    with: { reporter: true, rescuer: true, events: { with: { actor: { columns: { name: true } } } } },
  });
}

export async function dashboardData() {
  const byStatus = await db.select({ status: requests.status, n: count() }).from(requests).groupBy(requests.status);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, byStatus.find((r) => r.status === s)?.n ?? 0])) as Record<Status, number>;

  const pending = await db
    .select({
      id: requests.id, code: requests.code, petType: requests.petType, condition: requests.condition, area: requests.area, createdAt: requests.createdAt,
    })
    .from(requests).where(eq(requests.status, "pending")).limit(200);
  const attention = pending.sort(compareByUrgency).slice(0, 6);

  const recent = await db
    .select({ id: requestEvents.id, type: requestEvents.type, message: requestEvents.message, at: requestEvents.createdAt, requestId: requests.id, code: requests.code })
    .from(requestEvents).innerJoin(requests, eq(requestEvents.requestId, requests.id))
    .orderBy(desc(requestEvents.createdAt), desc(requestEvents.id)).limit(8);

  return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0), attention, recent };
}

export async function listRescuers() {
  const jobs = await db
    .select({
      rescuerId: requests.rescuerId,
      total: count(),
      open: sql<number>`sum(case when ${requests.status} = 'assigned' then 1 else 0 end)`,
    })
    .from(requests).where(sql`${requests.rescuerId} is not null`).groupBy(requests.rescuerId);
  const all = await db.select().from(rescuers).orderBy(desc(rescuers.active), rescuers.name);
  return all.map((r) => {
    const j = jobs.find((x) => x.rescuerId === r.id);
    return { ...r, total: j?.total ?? 0, open: Number(j?.open ?? 0) };
  });
}

export async function listReporters() {
  const rows = await db
    .select({ id: reporters.id, name: reporters.name, phone: reporters.phone, createdAt: reporters.createdAt, n: count(requests.id) })
    .from(reporters).leftJoin(requests, eq(requests.reporterId, reporters.id)).groupBy(reporters.id).orderBy(desc(reporters.createdAt));
  return rows;
}

export async function analytics(days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await db.select().from(requests).where(gte(requests.createdAt, since));

  const tally = <K extends string>(keys: readonly K[], pick: (r: (typeof rows)[number]) => K) =>
    keys.map((k) => ({ key: k, n: rows.filter((r) => pick(r) === k).length }));

  const areas = new Map<string, number>();
  for (const r of rows) areas.set(r.area, (areas.get(r.area) ?? 0) + 1);

  // Dhaka has no DST, so a fixed +6h offset gives the local calendar day.
  const dayKey = (d: Date) => new Date(d.getTime() + 6 * 3_600_000).toISOString().slice(0, 10);
  const perDay = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) perDay.set(dayKey(new Date(Date.now() - i * 86_400_000)), 0);
  for (const r of rows) {
    const k = dayKey(r.createdAt);
    if (perDay.has(k)) perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }

  const hours = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 3_600_000;
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const assigned = rows.filter((r) => r.assignedAt);
  const done = rows.filter((r) => r.completedAt);

  return {
    total: rows.length,
    byStatus: tally(STATUSES, (r) => r.status),
    byPet: tally(schema.PET_TYPES, (r) => r.petType),
    byCondition: tally(CONDITIONS, (r) => r.condition),
    topAreas: [...areas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([key, n]) => ({ key, n })),
    perDay: [...perDay.entries()].map(([day, n]) => ({ day, n })),
    avgAssignHours: avg(assigned.map((r) => hours(r.createdAt, r.assignedAt!))),
    avgCompleteHours: avg(done.map((r) => hours(r.createdAt, r.completedAt!))),
    donations: rows.reduce((s, r) => s + (r.donationAmount ?? 0), 0),
    completionRate: rows.length ? done.length / rows.length : null,
  };
}

/** Open requests of the same kind in the same area within 48h: likely the same animal reported twice. */
export async function findPossibleDuplicates(r: { id: number; area: string; petType: schema.PetType; createdAt: Date }) {
  const since = new Date(r.createdAt.getTime() - 48 * 3_600_000);
  return db
    .select({ id: requests.id, code: requests.code, status: requests.status, createdAt: requests.createdAt })
    .from(requests)
    .where(and(
      ne(requests.id, r.id), eq(requests.area, r.area), eq(requests.petType, r.petType),
      inArray(requests.status, ["pending", "assigned"]), gte(requests.createdAt, since),
    ))
    .orderBy(desc(requests.createdAt))
    .limit(5);
}

export async function listStaff() {
  return db.select({ id: schema.staff.id, name: schema.staff.name, email: schema.staff.email, createdAt: schema.staff.createdAt }).from(schema.staff).orderBy(schema.staff.createdAt);
}
