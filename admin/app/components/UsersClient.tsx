"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { AdminUserRow } from "@/actions/admin";
import { updateUserRole } from "@/actions/admin";
import { AdminPageHeader, SearchInput, Table, TableHead, Th, TableRow, Td, EmptyState } from "@/components/ui";

const ROLE_UI: Record<string, string> = {
  renter: "admin.role_renter",
  vendor: "admin.role_vendor",
  admin: "admin.role_admin",
};

export default function UsersClient({
  users,
  error,
}: {
  users: AdminUserRow[];
  error: string | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(error);

  const filtered = useMemo(() => {
    let list = users;
    if (filter !== "all") list = list.filter((u) => u.role === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.full_name ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.phone ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, search, filter]);

  async function changeRole(userId: string, role: string) {
    if (role !== "renter" && role !== "vendor" && role !== "admin") return;
    setBusyId(userId);
    setErr(null);
    const res = await updateUserRole(userId, role);
    setBusyId(null);
    if (res.error) {
      setErr(res.error);
    } else {
      router.refresh();
    }
  }

  function fmtDate(v: string) {
    return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div>
      <AdminPageHeader kicker={t("admin.nav_users")} title={t("admin.users_title")} subtitle={t("admin.users_subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("admin.search_placeholder")} />
        <div className="flex gap-2">
          {["all", "renter", "vendor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                filter === r
                  ? "bg-accent text-paper"
                  : "border border-surface-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {r === "all" ? t("admin.filter_all") : t(ROLE_UI[r])}
            </button>
          ))}
        </div>
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
            <Th>{t("admin.col_email")}</Th>
            <Th>{t("admin.col_phone")}</Th>
            <Th>{t("admin.col_role")}</Th>
            <Th>{t("admin.col_joined")}</Th>
            <Th>{t("common.aksi")}</Th>
          </TableHead>
          <tbody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <Td className="font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated">
                      <Users size={13} className="text-accent" />
                    </span>
                    {u.full_name ?? "—"}
                  </span>
                </Td>
                <Td>{u.email ?? "—"}</Td>
                <Td>{u.phone ?? "—"}</Td>
                <Td>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      u.role === "admin"
                        ? "bg-accent/15 text-accent"
                        : u.role === "vendor"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-bg-elevated text-text-secondary"
                    }`}
                  >
                    {t(ROLE_UI[u.role] ?? "admin.role_renter")}
                  </span>
                </Td>
                <Td className="text-text-secondary">{fmtDate(u.created_at)}</Td>
                <Td>
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-surface-border bg-surface px-2 py-1.5 text-xs text-text-primary outline-none transition focus:border-accent/40 disabled:opacity-50"
                  >
                    <option value="renter">{t("admin.role_renter")}</option>
                    <option value="vendor">{t("admin.role_vendor")}</option>
                    <option value="admin">{t("admin.role_admin")}</option>
                  </select>
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}