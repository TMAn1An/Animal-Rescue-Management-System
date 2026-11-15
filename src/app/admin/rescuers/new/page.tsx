import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { RescuerForm } from "../rescuer-form";

export const metadata: Metadata = { title: "Add rescuer" };

export default async function NewRescuer() {
  const { t } = await getT();
  return (<div className="space-y-6"><h1 className="text-3xl font-extrabold tracking-tight">{t.admin.addRescuer}</h1><RescuerForm t={t} /></div>);
}
