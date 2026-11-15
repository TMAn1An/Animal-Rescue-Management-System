import Link from "next/link";
import { getT } from "@/i18n/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="container-page flex-1 py-24 text-center">
        <p className="text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">{t.common.notFoundTitle}</h1>
        <p className="mt-2 text-muted">{t.common.notFoundBody}</p>
        <Link href="/" className="btn btn-primary mt-8">{t.common.goHome}</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
