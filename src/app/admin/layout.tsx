import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { AdminTabs } from "@/components/admin-tabs";
import { SiteHeader } from "@/components/site-header";
import { logout } from "@/app/actions/auth";
import { getT } from "@/i18n/server";
import { getPulse } from "@/lib/pulse";
import { requireStaff } from "@/lib/session";
import { LiveRefresh } from "@/components/live-refresh";
import Link from "next/link";

export const metadata: Metadata = { title: { default: "Console", template: "%s · Console" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const { t } = await getT();
  const pulse = await getPulse();
  const items = [
    { href: "/admin", label: t.nav.dashboard }, { href: "/admin/requests", label: t.nav.requests, badge: pulse.pending },
    { href: "/admin/rescuers", label: t.nav.rescuers }, { href: "/admin/reporters", label: t.nav.reporters },
    { href: "/admin/reports", label: t.nav.reports }, { href: "/admin/staff", label: t.nav.team },
  ];
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page py-6 sm:py-8">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <AdminTabs items={items} />
          <form action={logout} className="flex items-center gap-3 text-sm text-muted">
            <LiveRefresh initial={pulse} labels={{ on: t.live.on, newRequest: t.live.newRequest, view: t.live.view, dismiss: t.live.dismiss, pet: t.pet, condition: t.condition }} />
            <Link href="/admin/account" className="hidden font-semibold hover:text-ink sm:inline">{staff.name}</Link>
            <button className="btn btn-secondary btn-sm"><LogOut size={15} aria-hidden /> {t.nav.logout}</button>
          </form>
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </>
  );
}
