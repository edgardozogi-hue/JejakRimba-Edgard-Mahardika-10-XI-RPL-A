"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { AdminReviewRow } from "@/actions/admin";
import { deleteReview } from "@/actions/admin";
import { AdminPageHeader, SearchInput, Table, TableHead, Th, TableRow, Td, EmptyState } from "@/components/ui";

export default function ReviewsClient({
  reviews,
  error,
}: {
  reviews: AdminReviewRow[];
  error: string | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(error);

  const filtered = useMemo(() => {
    let list = reviews;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.comment ?? "").toLowerCase().includes(q) ||
          (r.reviewer_name ?? "").toLowerCase().includes(q) ||
          r.equipment_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reviews, search]);

  async function remove(id: string) {
    setBusyId(id);
    setErr(null);
    const res = await deleteReview(id);
    setBusyId(null);
    if (res.error) setErr(res.error);
    else router.refresh();
  }

  function fmtDate(v: string) {
    return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function Stars({ rating }: { rating: number }) {
    return (
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            className={i <= rating ? "fill-amber-400 text-amber-400" : "text-surface-border"}
          />
        ))}
      </span>
    );
  }

  return (
    <div>
      <AdminPageHeader kicker={t("admin.nav_reviews")} title={t("admin.reviews_title")} subtitle={t("admin.reviews_subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("admin.search_placeholder")} />
        <span className="text-xs text-text-secondary">
          {reviews.length} {t("admin.stat_reviews")}
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
            <Th>{t("admin.col_reviewer")}</Th>
            <Th>{t("admin.col_rating")}</Th>
            <Th>{t("admin.col_comment")}</Th>
            <Th>{t("admin.col_date")}</Th>
            <Th>{t("common.aksi")}</Th>
          </TableHead>
          <tbody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <Td className="font-semibold">{r.equipment_name}</Td>
                <Td>{r.reviewer_name ?? "—"}</Td>
                <Td>
                  <Stars rating={r.rating} />
                </Td>
                <Td className="max-w-xs truncate text-text-secondary">{r.comment ?? "—"}</Td>
                <Td className="text-text-secondary">{fmtDate(r.created_at)}</Td>
                <Td>
                  <button
                    onClick={() => remove(r.id)}
                    disabled={busyId === r.id}
                    title={t("admin.delete")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
