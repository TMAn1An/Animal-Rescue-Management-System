import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { getT } from "@/i18n/server";
import { RescuerForm } from "../rescuer-form";

export const metadata: Metadata = { title: "Edit rescuer" };

export default async function EditRescuer({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [r] = Number.isInteger(id) ? await db.select().from(schema.rescuers).where(eq(schema.rescuers.id, id)) : [];
  if (!r) notFound();
  const { t } = await getT();
  return (<div className="space-y-6"><h1 className="text-3xl font-extrabold tracking-tight">{t.admin.editRescuer}</h1><RescuerForm t={t} initial={r} /></div>);
}
