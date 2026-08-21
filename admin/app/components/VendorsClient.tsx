"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Check, Ban, RotateCcw, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { AdminVendorRow } from "@/actions/admin";
import { approveVendor, toggleVendorActive, deleteVendor } from "@/actions/admin";
import { AdminPageHeader, SearchInput, Table, TableHead, Th, TableRow, Td, EmptyState, ActivePill } from "@/components/ui";

export default function VendorsClient({
  vendors,
  error,
}: {
  vendors: AdminVendorRow[];
  error: string | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(error);

  const filtered = useMemo(() => {
    let list = vendors;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.business_name.toLowerCase().includes(q) ||
          (v.owner_name ?? "").toLowerCase().includes(q) ||
          (v.city ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [vendors, search]);

  async function verify(id: string) {
    setBusyId(id);
    setErr(null);
    const res = await approveVendor(id);
    setBusyId(null);
    if (res.error) setErr(res.error);
    else router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    setBusyId(id);
    setErr(null);
    const res = await toggleVendorActive(id, isActive);
    setBusyId(null);
    if (res.error) setErr(res.error);
    else router.refresh();
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(t("admin.vendor_delete_confirm").replace("{name}", name))) return;
    setBusyId(id);
    setErr(null);
    const res = await deleteVendor(id);
    setBusyId(null);
    if (res.error) setErr(res.error);
    else router.refresh();
  }

  function fmtDate(v: string) {
    return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div>
      <AdminPageHeader kicker={t("admin.nav_vendors")} title={t("admin.vendors_title")} subtitle={t("admin.vendors_subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("admin.search_placeholder")} />
        <span className="text-xs text-text-secondary">
          {vendors.length} {t("admin.stat_vendors")}
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
            <Th>{t("admin.col_business")}</Th>
            <Th>{t("admin.col_owner")}</Th>
            <Th>{t("common.lokasi")}</Th>
            <Th>{t("admin.col_phone")}</Th>
            <Th>{t("admin.col_items")}</Th>
            <Th>{t("admin.col_status")}</Th>
            <Th>{t("admin.col_joined")}</Th>
            <Th>{t("common.aksi")}</Th>
          </TableHead>
          <tbody>
            {filtered.map((v) => (
              <TableRow key={v.id}>
                <Td className="font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                      <Store size={13} className="text-accent" />
                    </span>
                    {v.business_name}
                  </span>
                </Td>
                <Td>{v.owner_name ?? "—"}</Td>
                <Td>{v.city ?? "—"}</Td>
                <Td>{v.whatsapp_number ?? "—"}</Td>
                <Td>{v.equipment_count}</Td>
                <Td>
                  <ActivePill active={v.is_active} />
                </Td>
                <Td className="text-text-secondary">{fmtDate(v.created_at)}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-2">
                    {!v.is_active ? (
                      <button
                        onClick={() => verify(v.id)}
                        disabled={busyId === v.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                      >
                        <Check size={13} /> {t("admin.verify")}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleActive(v.id, false)}
                        disabled={busyId === v.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-500 transition hover:bg-amber-500/10 disabled:opacity-50"
                      >
                        <Ban size={13} /> {t("admin.suspend")}
                      </button>
                    )}
                    {!v.is_active && (
                      <button
                        onClick={() => toggleActive(v.id, true)}
                        disabled={busyId === v.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-bg-elevated disabled:opacity-50"
                      >
                        <RotateCcw size={13} /> {t("admin.reactivate")}
                      </button>
                    )}
                    <button
                      onClick={() => remove(v.id, v.business_name)}
                      disabled={busyId === v.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 size={13} /> {t("admin.delete")}
                    </button>
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