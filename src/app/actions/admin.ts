"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { parseDhakaLocal } from "@/lib/format";
import { requireStaff } from "@/lib/session";
import { reporterSchema, rescuerSchema, staffSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { canTransition } from "@/lib/workflow";

export type ActionResult = { ok?: boolean; error?: string; errors?: FieldErrors };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const touch = (id: number) => {
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
};

async function loadRequest(id: number) {
  const [r] = await db.select().from(schema.requests).where(eq(schema.requests.id, id));
  return r;
}

/* ---------- Request workflow ---------- */

export async function assignRescuer(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const id = Number(fd.get("id"));
  const rescuerId = Number(fd.get("rescuerId"));
  const eta = parseDhakaLocal(str(fd, "eta"));
  if (!eta || eta.getTime() < Date.now() - 60_000) return { errors: { eta: "eta" } };

  const [rescuer] = await db.select().from(schema.rescuers).where(and(eq(schema.rescuers.id, rescuerId), eq(schema.rescuers.active, true)));
  if (!rescuer) return { errors: { rescuerId: "rescuer" } };

  const req = await loadRequest(id);
  if (!req) return { error: "notFound" };
  const isReassign = req.status === "assigned";
  if (!isReassign && !canTransition(req.status, "assigned")) return { error: "invalidTransition" };

  await db.transaction(async (tx) => {
    await tx.update(schema.requests)
      .set({ status: "assigned", rescuerId, eta, assignedAt: new Date(), completedAt: null, updatedAt: new Date() })
      .where(eq(schema.requests.id, id));
    await tx.insert(schema.requestEvents).values({
      requestId: id, type: isReassign ? "reassigned" : "assigned", message: rescuer.name, actorId: staff.id,
    });
  });
  touch(id);
  return { ok: true };
}

export async function completeRequest(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const id = Number(fd.get("id"));
  const outcome = str(fd, "outcome");
  if (outcome.length < 3 || outcome.length > 2000) return { errors: { outcome: "description" } };
  const req = await loadRequest(id);
  if (!req) return { error: "notFound" };
  if (!canTransition(req.status, "completed")) return { error: "invalidTransition" };

  await db.transaction(async (tx) => {
    await tx.update(schema.requests).set({ status: "completed", outcome, completedAt: new Date(), updatedAt: new Date() }).where(eq(schema.requests.id, id));
    await tx.insert(schema.requestEvents).values({ requestId: id, type: "completed", message: outcome, actorId: staff.id });
  });
  touch(id);
  return { ok: true };
}

type SimpleMove = "cancel" | "reopen" | "unassign";
export async function moveRequest(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const id = Number(fd.get("id"));
  const move = str(fd, "move") as SimpleMove;
  const req = await loadRequest(id);
  if (!req) return { error: "notFound" };

  const plan: Record<SimpleMove, { to: schema.Status; event: schema.EventType; patch: Partial<typeof schema.requests.$inferInsert> }> = {
    cancel: { to: "cancelled", event: "cancelled", patch: { rescuerId: null, eta: null } },
    unassign: { to: "pending", event: "reopened", patch: { rescuerId: null, eta: null, assignedAt: null } },
    reopen: req.status === "completed"
      ? { to: "assigned", event: "reopened", patch: { completedAt: null, outcome: null } }
      : { to: "pending", event: "reopened", patch: {} },
  };
  const step = plan[move];
  if (!step || !canTransition(req.status, step.to)) return { error: "invalidTransition" };

  await db.transaction(async (tx) => {
    await tx.update(schema.requests).set({ ...step.patch, status: step.to, updatedAt: new Date() }).where(eq(schema.requests.id, id));
    await tx.insert(schema.requestEvents).values({ requestId: id, type: step.event, actorId: staff.id });
  });
  touch(id);
  return { ok: true };
}

export async function addNote(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const id = Number(fd.get("id"));
  const message = str(fd, "message");
  if (message.length < 2 || message.length > 500) return { errors: { message: "description" } };
  if (!(await loadRequest(id))) return { error: "notFound" };
  await db.insert(schema.requestEvents).values({ requestId: id, type: "note", message, actorId: staff.id });
  touch(id);
  return { ok: true };
}

export async function deleteRequest(fd: FormData) {
  await requireStaff();
  const id = Number(fd.get("id"));
  await db.delete(schema.requests).where(eq(schema.requests.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin/requests");
}

/* ---------- Rescuers ---------- */

export async function saveRescuer(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = rescuerSchema.safeParse({
    name: str(fd, "name"), phone: str(fd, "phone"), nid: str(fd, "nid"), area: str(fd, "area"), active: fd.get("active") === "on",
  });
  if (!parsed.success) return { errors: toFieldErrors(parsed.error) };
  const id = Number(fd.get("id") || 0);
  const v = { ...parsed.data, nid: parsed.data.nid ?? null, area: parsed.data.area ?? null };
  if (id) await db.update(schema.rescuers).set(v).where(eq(schema.rescuers.id, id));
  else await db.insert(schema.rescuers).values(v);
  revalidatePath("/admin/rescuers");
  redirect("/admin/rescuers?saved=1");
}

export async function deleteRescuer(fd: FormData) {
  await requireStaff();
  // Foreign key is ON DELETE SET NULL; also return orphaned open jobs to the queue.
  const id = Number(fd.get("id"));
  await db.transaction(async (tx) => {
    await tx.update(schema.requests)
      .set({ status: "pending", eta: null, assignedAt: null, updatedAt: new Date() })
      .where(and(eq(schema.requests.rescuerId, id), eq(schema.requests.status, "assigned")));
    await tx.delete(schema.rescuers).where(eq(schema.rescuers.id, id));
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/rescuers?deleted=1");
}

/* ---------- Reporters ---------- */

export async function saveReporter(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = reporterSchema.safeParse({ name: str(fd, "name"), phone: str(fd, "phone") });
  if (!parsed.success) return { errors: toFieldErrors(parsed.error) };
  const id = Number(fd.get("id"));
  const [clash] = await db.select({ id: schema.reporters.id }).from(schema.reporters)
    .where(and(eq(schema.reporters.phone, parsed.data.phone), sql`${schema.reporters.id} != ${id}`));
  if (clash) return { errors: { phone: "duplicatePhone" } };
  await db.update(schema.reporters).set(parsed.data).where(eq(schema.reporters.id, id));
  revalidatePath("/admin/reporters");
  redirect("/admin/reporters?saved=1");
}

export async function deleteReporter(fd: FormData) {
  await requireStaff();
  await db.delete(schema.reporters).where(eq(schema.reporters.id, Number(fd.get("id"))));
  revalidatePath("/admin", "layout");
  redirect("/admin/reporters?deleted=1");
}

/* ---------- Team ---------- */

export async function createStaff(_p: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = staffSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email"), password: String(fd.get("password") ?? "") });
  if (!parsed.success) return { errors: toFieldErrors(parsed.error) };
  const [clash] = await db.select({ id: schema.staff.id }).from(schema.staff).where(eq(schema.staff.email, parsed.data.email));
  if (clash) return { errors: { email: "staffEmailTaken" } };
  await db.insert(schema.staff).values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await bcrypt.hash(parsed.data.password, 12) });
  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function deleteStaff(fd: FormData) {
  const me = await requireStaff();
  const id = Number(fd.get("id"));
  const [{ n }] = await db.select({ n: count() }).from(schema.staff);
  if (id === me.id || n <= 1) redirect("/admin/staff?error=1");
  await db.delete(schema.staff).where(eq(schema.staff.id, id));
  revalidatePath("/admin/staff");
  redirect("/admin/staff?removed=1");
}
