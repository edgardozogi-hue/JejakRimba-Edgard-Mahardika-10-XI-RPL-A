"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { AdminBookingRow } from "@/actions/admin";
import { adminUpdateBookingStatus } from "@/actions/admin";
import { AdminPageHeader, SearchInput, Table, TableHead, Th, TableRow, Td, EmptyState } from "@/components/ui";

const STATUS_UI: Record<string, string> = {
  menunggu_konfirmasi: "admin.booking_menunggu_konfirmasi",
  dikonfirmasi: "admin.booking_dikonfirmasi",
  sedang_berjalan: "admin.booking_sedang_berjalan",
  selesai: "admin.booking_selesai",
  dibatalkan: "admin.booking_dibatalkan",
};

const STATUS_BADGE: Record<string, string> = {
  menunggu_konfirmasi: "bg-amber-500/10 text-amber-500",
  dikonfirmasi: "bg-blue-500/10 text-blue-500",
  sedang_berjalan: "bg-violet-500/10 text-violet-500",
  selesai: "bg-moss/15 text-moss",
  dibatalkan: "bg-red-500/10 text-red-500",
};

const NEXT_STATUS: Record<string, string> = {
  menunggu_konfirmasi: "dikonfirmasi",
  dikonfirmasi: "sedang_berjalan",
  sedang_berjalan: "selesai",
};

export default function BookingsClient({
  bookings,
  error,
}: {
  bookings: AdminBookingRow[];
  error: string | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(error);

  const filtered = useMemo(() => {
    let list = bookings;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          (b.equipment_name ?? "").toLowerCase().includes(q) ||
          (b.vendor_name ?? "").toLowerCase().includes(q) ||
          (b.renter_name ?? "").toLowerCase().includes(q) ||
          b.status.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, search]);

  function fmtRupiah(v: number) {
    return `Rp ${v.toLocaleString("id-ID")}`;
  }

  function fmtDate(v: string) {
    return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  async function advance(id: string, status: string) {
    const next = NEXT_STATUS[status];
    if (!next) return;
    setBusyId(id);
    setErr(null);
    const res = await adminUpdateBookingStatus(id, next as "dikonfirmasi" | "sedang_berjalan" | "selesai" | "dibatalkan");
    setBusyId(null);
    if (res.error) setErr(res.error);
    else router.refresh();
  }

  async function cancel(id: string) {
    setBusyId(id);
    setErr(null);
    const res = await adminUpdateBookingStatus(id, "dibatalkan");
    setBusyId(null);
    if (res.error) setErr(res.error);
    else router.refresh();
  }

  return (
    <div>
      <AdminPageHeader kicker={t("admin.nav_bookings")} title={t("admin.bookings_title")} subtitle={t("admin.bookings_subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("admin.search_placeholder")} />
        <span className="text-xs text-text-secondary">
          {bookings.length} {t("admin.stat_bookings")}
        </span>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message={t("admin.no_data")} />
      ) : (
        <Table>
          <TableHead>
            <Th>{t("admin.col_equipment")}</Th>
            <Th>{t("admin.col_vendor")}</Th>
            <Th>{t("admin.col_renter")}</Th>
            <Th>{t("admin.col_quantity")}</Th>
            <Th>{t("admin.col_dates")}</Th>
            <Th>{t("admin.col_total")}</Th>
            <Th>{t("admin.col_status")}</Th>
            <Th>{t("common.aksi")}</Th>
          </TableHead>
          <tbody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <Td className="font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                      <ClipboardList size={13} className="text-accent" />
                    </span>
                    <span className="flex flex-col">
                      <span>{b.equipment_name}</span>
                      {b.is_multi && (
                        <span className="text-[11px] font-normal text-text-secondary">
                          {b.item_count} item
                        </span>
                      )}
                    </span>
                  </span>
                </Td>
                <Td>{b.vendor_name}</Td>
                <Td>{b.renter_name ?? "—"}</Td>
                <Td>{b.quantity}</Td>
                <Td className="text-text-secondary">
                  {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                </Td>
                <Td className="font-semibold">{fmtRupiah(b.total_price)}</Td>
                <Td>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      STATUS_BADGE[b.status] ?? "bg-bg-elevated text-text-secondary"
                    }`}
                  >
                    {t(STATUS_UI[b.status] ?? "admin.booking_menunggu_konfirmasi")}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {NEXT_STATUS[b.status] && (
                      <button
                        onClick={() => advance(b.id, b.status)}
                        disabled={busyId === b.id}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                      >
                        {t("admin.mark_next")}
                      </button>
                    )}
                    {b.status !== "dibatalkan" && b.status !== "selesai" && (
                      <button
                        onClick={() => cancel(b.id)}
                        disabled={busyId === b.id}
                        className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {t("admin.cancel")}
                      </button>
                    )}
                  </div>
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}