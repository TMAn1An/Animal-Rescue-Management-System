import { NextResponse, type NextRequest } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Spreadsheet apps execute cells starting with these characters as formulas. */
const safe = (v: unknown) => {
  const s = v == null ? "" : String(v);
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await getCurrentStaff())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const status = req.nextUrl.searchParams.get("status");
  const where = status && (schema.STATUSES as readonly string[]).includes(status) ? eq(schema.requests.status, status as schema.Status) : undefined;

  const rows = await db
    .select({
      code: schema.requests.code, status: schema.requests.status, petType: schema.requests.petType, condition: schema.requests.condition,
      area: schema.requests.area, address: schema.requests.address, description: schema.requests.description,
      donation: schema.requests.donationAmount, reporter: schema.reporters.name, reporterPhone: schema.reporters.phone,
      rescuer: schema.rescuers.name, createdAt: schema.requests.createdAt, assignedAt: schema.requests.assignedAt, completedAt: schema.requests.completedAt, outcome: schema.requests.outcome,
    })
    .from(schema.requests)
    .innerJoin(schema.reporters, eq(schema.requests.reporterId, schema.reporters.id))
    .leftJoin(schema.rescuers, eq(schema.requests.rescuerId, schema.rescuers.id))
    .where(and(where))
    .orderBy(desc(schema.requests.createdAt));

  const header = ["Code", "Status", "Animal", "Condition", "Area", "Address", "Description", "Donation", "Reporter", "Reporter phone", "Rescuer", "Reported", "Assigned", "Completed", "Outcome"];
  const iso = (d: Date | null) => (d ? d.toISOString() : "");
  const lines = [header.map(safe).join(",")];
  for (const r of rows) {
    lines.push([r.code, r.status, r.petType, r.condition, r.area, r.address, r.description, r.donation, r.reporter, r.reporterPhone, r.rescuer, iso(r.createdAt), iso(r.assignedAt), iso(r.completedAt), r.outcome].map(safe).join(","));
  }
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rescue-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
