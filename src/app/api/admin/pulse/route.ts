import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/session";
import { getPulse } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getCurrentStaff())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getPulse(), { headers: { "Cache-Control": "no-store" } });
}
