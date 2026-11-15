"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/phone";
import { reportSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { generateTrackingCode, TRACKING_CODE_RE } from "@/lib/workflow";

export type ReportState = { errors?: FieldErrors; formError?: string; values?: Record<string, string> };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function submitReport(_prev: ReportState, fd: FormData): Promise<ReportState> {
  const values = Object.fromEntries(["name", "phone", "petType", "condition", "area", "address", "description", "note", "donation"].map((k) => [k, str(fd, k)]));

  // Honeypot: bots fill hidden fields. Pretend success without storing anything.
  if (str(fd, "website")) redirect("/report/done?code=AR-000000");

  if (!rateLimit(`report:${await clientIp()}`, 5, 10 * 60_000)) return { formError: "tooMany", values };

  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), values };
  const d = parsed.data;

  let code = "";
  for (let attempt = 0; attempt < 5 && !code; attempt++) {
    const candidate = generateTrackingCode();
    const [clash] = await db.select({ id: schema.requests.id }).from(schema.requests).where(eq(schema.requests.code, candidate));
    if (!clash) code = candidate;
  }
  if (!code) return { formError: "generic", values };

  await db.transaction(async (tx) => {
    // Find-or-create the reporter by phone number; keep the name already on file.
    await tx.insert(schema.reporters).values({ name: d.name, phone: d.phone }).onConflictDoNothing({ target: schema.reporters.phone });
    const [reporter] = await tx.select().from(schema.reporters).where(eq(schema.reporters.phone, d.phone));
    const [request] = await tx
      .insert(schema.requests)
      .values({
        code, reporterId: reporter.id, petType: d.petType, condition: d.condition, area: d.area, address: d.address,
        description: d.description, note: d.note ?? null, donationAmount: d.donation ?? null,
      })
      .returning({ id: schema.requests.id });
    await tx.insert(schema.requestEvents).values({ requestId: request.id, type: "created" });
  });

  redirect(`/report/done?code=${code}`);
}

export type TrackState =
  | { found: false; error?: "notFound" | "tooMany"; code?: string }
  | {
      found: true;
      view: {
        code: string; status: schema.Status; petType: schema.PetType; condition: schema.Condition; area: string;
        createdAt: string; eta: string | null; outcome: string | null;
        rescuer: { name: string; phone: string } | null;
        events: { type: schema.EventType; message: string | null; at: string }[];
      };
    };

async function buildTrackState(code: string, phone: string | null): Promise<TrackState> {
  if (!TRACKING_CODE_RE.test(code) || !phone) return { found: false, error: "notFound", code };

  const row = await db.query.requests.findFirst({
    where: and(eq(schema.requests.code, code)),
    with: { reporter: true, rescuer: true, events: true },
  });
  // Same response for "wrong code" and "wrong phone" so codes can't be probed.
  if (!row || row.reporter.phone !== phone) return { found: false, error: "notFound", code };

  return {
    found: true,
    view: {
      code: row.code, status: row.status, petType: row.petType, condition: row.condition, area: row.area,
      createdAt: row.createdAt.toISOString(), eta: row.eta?.toISOString() ?? null, outcome: row.outcome,
      rescuer: row.rescuer && row.status !== "pending" ? { name: row.rescuer.name, phone: row.rescuer.phone } : null,
      events: [...row.events]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id - b.id)
        .map((e) => ({ type: e.type, message: e.type === "assigned" || e.type === "reassigned" ? null : e.message, at: e.createdAt.toISOString() })),
    },
  };
}

export async function trackRequest(_prev: TrackState | null, fd: FormData): Promise<TrackState> {
  const code = str(fd, "code").trim().toUpperCase();
  if (!rateLimit(`track:${await clientIp()}`, 15, 10 * 60_000)) return { found: false, error: "tooMany", code };
  return buildTrackState(code, normalizePhone(str(fd, "phone")));
}

/** Called every few seconds by the tracking page to keep the timeline live. */
export async function refreshTrack(code: string, phone: string): Promise<TrackState> {
  if (!rateLimit(`track-live:${await clientIp()}`, 90, 10 * 60_000)) return { found: false, error: "tooMany", code };
  return buildTrackState(String(code).toUpperCase(), normalizePhone(String(phone)));
}
