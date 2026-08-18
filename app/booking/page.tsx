"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  Package,
  XCircle,
  ChevronRight,
  Tent,
  Backpack,
  Mountain,
  Circle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { getUserBookings, BookingListItem } from "../actions/booking";
import PageShell from "../components/PageShell";
import { staggerContainer, fadeUp } from "../lib/animations";
import { useLanguage } from "../lib/i18n";

type BookingStatus = "active" | "completed" | "pending" | "cancelled";

const dbStatusToFrontend: Record<string, BookingStatus> = {
  menunggu_konfirmasi: "pending",
  dikonfirmasi: "pending",
  sedang_berjalan: "active",
  selesai: "completed",
  dibatalkan: "cancelled",
};

// â”€â”€ Config â”€â”€

const statusConfig: Record<
  BookingStatus,
  { labelKey: string; bg: string; text: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  active: { labelKey: "booking.status_active", bg: "bg-accent/15", text: "text-accent", icon: Circle },
  completed: { labelKey: "booking.status_completed", bg: "bg-moss/15", text: "text-moss-light", icon: CalendarCheck },
  pending: { labelKey: "booking.status_pending", bg: "bg-amber/15", text: "text-amber", icon: Clock },
  cancelled: { labelKey: "booking.status_cancelled", bg: "bg-red/15", text: "text-red", icon: XCircle },
};

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Tenda: Tent,
  Carrier: Backpack,
  "Sleeping Bag": Package,
  Kompor: Mountain,
};

// â”€â”€ Helpers â”€â”€

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// â”€â”€ Page â”€â”€

export default function BookingSayaPage() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBookings().then((res) => {
      if (!res.error) setBookings(res.bookings);
      setLoading(false);
    });
  }, []);

  return (
    <PageShell>
      <motion.div
        className="mx-auto max-w-4xl px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Page header */}
        <motion.div variants={fadeUp} className="mb-8">
          <p className="font-archivo text-xs tracking-wide text-accent">{t("booking.kicker")}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">{t("booking.title")}</h1>
        </motion.div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="animate-spin text-accent" />
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <motion.div variants={fadeUp} className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
              <Package size={32} className="text-text-secondary" />
            </div>
            <p className="font-display text-lg font-semibold text-text-primary">{t("booking.empty_title")}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {t("booking.empty_desc")}
            </p>
            <Link href="/katalog">
              <span className="mt-4 inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                {t("booking.explore")}
              </span>
            </Link>
          </motion.div>
        ) : (
          /* Booking grid */
          <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => {
              const s = dbStatusToFrontend[booking.status] ?? "pending";
              const status = statusConfig[s];
              const Icon = categoryIcons[booking.equipment_category] ?? Package;

              return (
                <motion.div key={booking.id} variants={fadeUp}>
                  <Link href={`/booking/${booking.id}/status`} className="block">
                    <motion.div
                      className="rounded-2xl border border-surface-border bg-surface p-4 transition hover:border-accent"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                          <Icon size={24} className="text-accent" />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-sm font-semibold text-text-primary">
                            {booking.equipment_name}
                          </p>
                          <p className="mt-0.5 text-xs text-text-secondary">{booking.equipment_category}</p>
                          {booking.isMulti && booking.items.length > 1 && (
                            <p className="mt-1 flex flex-wrap gap-1">
                              {booking.items.slice(0, 3).map((it) => (
                                <span
                                  key={it.equipment_id}
                                  className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-archivo text-accent"
                                >
                                  {it.quantity}x {it.name}
                                </span>
                              ))}
                            </p>
                          )}

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                            <CalendarCheck size={12} className="shrink-0" />
                            <span className="font-archivo">
                              {formatDate(booking.start_date)} &ndash; {formatDate(booking.end_date)}
                            </span>
                          </div>

                          <p className="mt-1 font-archivo text-sm font-semibold text-accent">
                            {formatPrice(booking.total_price)}
                          </p>
                        </div>

                        {/* Status + chevron */}
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.bg} ${status.text}`}
                          >
                            {s === "active" ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            ) : (
                              <status.icon size={12} />
                            )}
                            {t(status.labelKey)}
                          </span>
                          <ChevronRight size={16} className="mt-1 text-text-secondary" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
}
