import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { getCurrentStaff } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentStaff()) redirect("/admin");
  const { t } = await getT();
  return (
    <div className="container-page max-w-md py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.login.title}</h1>
      <p className="mt-2 mb-8 text-muted">{t.login.subtitle}</p>
      <LoginForm t={t} />
    </div>
  );
}
