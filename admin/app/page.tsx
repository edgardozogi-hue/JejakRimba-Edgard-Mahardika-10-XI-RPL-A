import { getAdminOverview } from "@/actions/admin";
import AdminOverview from "@/components/AdminOverview";
import type { OverviewData } from "@/components/AdminOverviewData";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getAdminOverview();
  if (data.error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/5 p-16 text-center">
        <p className="font-display text-lg font-bold text-text-primary">Akses ditolak</p>
        <p className="text-sm text-text-secondary">{data.error}</p>
      </div>
    );
  }
  return <AdminOverview data={data as OverviewData} />;
}