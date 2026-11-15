import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { getT } from "@/i18n/server";
import { ReporterForm } from "./reporter-form";

export const metadata: Metadata = { title: "Edit reporter" };

export default async function EditReporter({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [r] = Number.isInteger(id) ? await db.select().from(schema.reporters).where(eq(schema.reporters.id, id)) : [];
  if (!r) notFound();
  const { t } = await getT();
  return (<div className="space-y-6"><h1 className="text-3xl font-extrabold tracking-tight">{t.admin.editReporter}</h1><ReporterForm t={t} initial={r} /></div>);
}
