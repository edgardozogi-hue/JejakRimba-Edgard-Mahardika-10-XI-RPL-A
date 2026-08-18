import Link from "next/link";
import PageShell from "../../components/PageShell";
import { getVendorOverview } from "../../actions/vendor";
import VendorDashboardClient from "./VendorDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardVendorPage() {
  const data = await getVendorOverview();

  // Belum login atau bukan vendor
  if (data.error) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center md:max-w-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
            <span className="font-display text-2xl font-black text-accent">V</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {data.error === "Not authenticated"
              ? "Kamu belum masuk"
              : "Akses khusus vendor"}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {data.error === "Not authenticated"
              ? "Masuk dulu untuk mengelola toko dan alat persewaanmu."
              : "Akun ini belum terdaftar sebagai vendor. Daftar sebagai vendor untuk mulai mengelola toko."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={data.error === "Not authenticated" ? "/masuk" : "/daftar"}
              className="flex flex-1 items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              {data.error === "Not authenticated" ? "Masuk" : "Daftar sebagai Vendor"}
            </Link>
            <Link
              href="/profil"
              className="flex flex-1 items-center justify-center rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent"
            >
              Kembali ke Profil
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return <VendorDashboardClient data={data} />;
}