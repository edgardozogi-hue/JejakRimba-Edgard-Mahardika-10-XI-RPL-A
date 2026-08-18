"use client";

import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ClipboardList,
  Wallet,
  Receipt,
  Star,
  Banknote,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { AdminPageHeader, StatCard } from "@/components/ui";
import RevenueChart from "@/components/RevenueChart";
import type { OverviewData } from "./AdminOverviewData";

export default function AdminOverview({ data }: { data: OverviewData }) {
  const { t } = useLanguage();

  return (
    <div>
      <AdminPageHeader
        kicker={t("admin.overview_title")}
        title={t("admin.overview_title")}
        subtitle={t("admin.overview_subtitle")}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Users} label={t("admin.stat_users")} value={data.users} />
        <StatCard icon={Store} label={t("admin.stat_vendors")} value={data.vendors} accent />
        <StatCard icon={Package} label={t("admin.stat_equipment")} value={data.equipment} />
        <StatCard icon={ClipboardList} label={t("admin.stat_bookings")} value={data.bookings} />
        <StatCard icon={Receipt} label={t("admin.stat_transactions")} value={data.transactions} />
        <StatCard icon={Star} label={t("admin.stat_reviews")} value={data.reviews} />
        <StatCard
          icon={Banknote}
          label={t("admin.stat_revenue")}
          value={data.revenue}
          prefix="Rp"
          accent
        />
        <StatCard
          icon={Wallet}
          label={t("admin.revenue_this_month")}
          value={data.revenueThisMonth}
          prefix="Rp"
        />
      </div>

      {/* Revenue chart */}
      <div className="mt-6 rounded-2xl border border-surface-border bg-surface p-5">
        <h2 className="mb-4 font-display text-base font-bold text-text-primary">
          {t("admin.revenue_title")}
        </h2>
        <RevenueChart data={data.revenueByMonth} />
      </div>

      {/* Quick nav */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickLink href="/users" label={t("admin.nav_users")} icon={Users} />
        <QuickLink href="/vendors" label={t("admin.nav_vendors")} icon={Store} />
        <QuickLink href="/equipment" label={t("admin.nav_equipment")} icon={Package} />
        <QuickLink href="/bookings" label={t("admin.nav_bookings")} icon={ClipboardList} />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-surface-border bg-surface p-4 transition hover:border-accent/40"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated">
          <Icon size={17} className="text-accent" />
        </span>
        <span className="text-sm font-semibold text-text-primary">{label}</span>
      </div>
      <ArrowUpRight size={16} className="text-text-secondary transition group-hover:text-accent" />
    </Link>
  );
}