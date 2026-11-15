import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { requireStaff } from "@/lib/session";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const staff = await requireStaff();
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-extrabold tracking-tight">{t.account.title}</h1><p className="text-muted">{t.account.subtitle} {staff.email}</p></div>
      <PasswordForm t={t} />
    </div>
  );
}
