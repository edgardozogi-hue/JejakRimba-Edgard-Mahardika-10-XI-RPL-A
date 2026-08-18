"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { AdminEquipmentRow } from "@/actions/admin";
import { AdminPageHeader, SearchInput, Table, TableHead, Th, TableRow, Td, EmptyState, ActivePill } from "@/components/ui";

export default function EquipmentClient({
  items,
  error,
}: {
  items: AdminEquipmentRow[];
  error: string | null;
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [err] = useState<string | null>(error);

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.category ?? "").toLowerCase().includes(q) ||
          (e.vendor_name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search]);

  function fmtRupiah(v: number) {
    return `Rp ${v.toLocaleString("id-ID")}`;
  }

  return (
    <div>
      <AdminPageHeader kicker={t("admin.nav_equipment")} title={t("admin.equipment_title")} subtitle={t("admin.equipment_subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("admin.search_placeholder")} />
        <span className="text-xs text-text-secondary">
          {items.length} {t("admin.stat_equipment")}
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
            <Th>{t("admin.col_name")}</Th>
            <Th>{t("admin.col_category")}</Th>
            <Th>{t("admin.col_vendor")}</Th>
            <Th>{t("admin.col_price")}</Th>
            <Th>{t("admin.col_stock")}</Th>
            <Th>{t("admin.col_status")}</Th>
          </TableHead>
          <tbody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <Td className="font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                      <Package size={13} className="text-accent" />
                    </span>
                    {e.name}
                  </span>
                </Td>
                <Td>{e.category ?? "—"}</Td>
                <Td>{e.vendor_name ?? "—"}</Td>
                <Td>{fmtRupiah(e.price_per_day)}</Td>
                <Td>{e.stock}</Td>
                <Td>
                  <ActivePill active={e.is_active} />
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}