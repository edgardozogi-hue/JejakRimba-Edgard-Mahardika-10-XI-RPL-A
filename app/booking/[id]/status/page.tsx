"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Tent, ArrowLeft, RefreshCw, PhoneCall, Check, Clock, X, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBookingById } from "../../../actions/booking";
import PageShell from "../../../components/PageShell";
import { staggerContainer, fadeUp, scaleIn } from "../../../lib/animations";
import { useLanguage } from "../../../lib/i18n";

type BookingStatus = "active" | "completed" | "waiting" | "cancelled";

const statusConfig: Record<
  BookingStatus,
  { labelKey: string; descKey: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }
> = {
  active: {
    labelKey: "booking.status_active_full",
    descKey: "booking.status_active_desc",
    icon: AlertCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  completed: {
    labelKey: "booking.status_completed_full",
    descKey: "booking.status_completed_desc",
    icon: Check,
    color: "text-moss-light",
    bg: "bg-moss-light/10",
  },
  waiting: {
    labelKey: "booking.status_waiting_full",
    descKey: "booking.status_waiting_desc",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  cancelled: {
    labelKey: "booking.status_cancelled",
    descKey: "booking.status_cancelled_desc",
    icon: X,
    color: "text-red",
    bg: "bg-red/10",
  },
};

const dbStatusToFrontend: Record<string, BookingStatus> = {
  menunggu_konfirmasi: "waiting",
  dikonfirmasi: "waiting",
  sedang_berjalan: "active",
  selesai: "completed",
  dibatalkan: "cancelled",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

type BookingDetail = {
  status: string;
  equipment_name: string;
  equipment_category: string;
  start_date: string;
  end_date: string;
  total_price: number;
  vendor_name: string;
  vendor_whatsapp?: string | null;
  items?: { equipment_id: string; name: string; category: string; quantity: number; price_per_day: number; subtotal: number }[];
  isMulti?: boolean;
};

export default function StatusPembayaranPage() {
  const params = useParams();
  const { t } = useLanguage();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBookingById(params.id as string).then(({ booking: b, error: err }) => {
      if (err) setError(err);
      else setBooking(b);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <PageShell showNav={false}>
        <div className="mx-auto flex max-w-md items-center justify-center px-6 py-20">
          <Loader size={24} className="animate-spin text-accent" />
        </div>
      </PageShell>
    );
  }

  if (error || !booking) {
    return (
      <PageShell showNav={false}>
        <motion.div
          className="mx-auto max-w-md px-6 py-20 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
              <AlertCircle size={40} className="text-text-secondary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text-primary">
              {t("booking.detail_not_found")}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {error ?? t("booking.detail_not_found_desc")}
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/booking">
              <span className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                <ArrowLeft size={18} />
                {t("booking.saya")}
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </PageShell>
    );
  }

  const frontendStatus: BookingStatus = dbStatusToFrontend[booking.status] ?? "waiting";
  const config = statusConfig[frontendStatus];
  const Icon = config.icon;
  const startFormatted = formatDate(booking.start_date);
  const endFormatted = formatDate(booking.end_date);

  return (
    <PageShell showNav={false}>
      <motion.div
        className="mx-auto max-w-md px-6 py-12 text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Large icon outline style */}
        <motion.div variants={scaleIn} className="mx-auto mb-6">
          <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${config.bg}`}>
            <Icon size={52} className={config.color} />
          </div>
        </motion.div>

        {/* Status label */}
        <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-text-primary">
          {t(config.labelKey)}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-text-secondary">
          {t(config.descKey)}
        </motion.p>

        {/* Booking summary */}
        <motion.div
          variants={fadeUp}
          className="mt-8 rounded-2xl border border-surface-border bg-surface p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Tent size={20} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{booking.equipment_name}</p>
              <p className="text-xs text-text-secondary">{booking.equipment_category}</p>
            </div>
          </div>

          {booking.isMulti && booking.items && booking.items.length > 0 && (
            <div className="mt-4 space-y-2 rounded-xl bg-bg-elevated p-3">
              {booking.items.map((it) => (
                <div key={it.equipment_id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-display text-text-primary">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="shrink-0 font-archivo text-text-secondary">
                    {formatPrice(it.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <hr className="my-3 border-surface-border" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{t("booking.tanggal_sewa")}</span>
              <span className="font-archivo text-text-primary">
                {startFormatted} &ndash; {endFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{t("booking.total")}</span>
              <span className="font-archivo font-semibold text-accent">{formatPrice(booking.total_price)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{t("booking.penyedia_label")}</span>
              <span className="font-archivo text-text-primary">{booking.vendor_name}</span>
            </div>
          </div>
        </motion.div>

        {/* CTAs based on status */}
        <motion.div variants={fadeUp} className="mt-8 space-y-3">
          {frontendStatus === "active" && (
            <Link href="/booking">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                <ArrowLeft size={18} />
                {t("booking.lihat_saya")}
              </div>
            </Link>
          )}

          {frontendStatus === "completed" && (
            <>
              <Link href="/katalog">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                  {t("booking.sewa_lagi")}
                </div>
              </Link>
              <Link href="/booking">
                <div className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent">
                  {t("booking.riwayat")}
                </div>
              </Link>
            </>
          )}

          {frontendStatus === "waiting" && (
            <Link href="/booking">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                <RefreshCw size={18} />
                {t("booking.cek_status")}
              </div>
            </Link>
          )}

          {frontendStatus === "cancelled" && (
            <>
              <Link href="/katalog">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                  <RefreshCw size={18} />
                  {t("booking.booking_ulang")}
                </div>
              </Link>
              {booking.vendor_whatsapp && (
                <a
                  href={`https://wa.me/${booking.vendor_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent">
                    <PhoneCall size={18} />
                    {t("booking.hubungi_admin")}
                  </div>
                </a>
              )}
            </>
          )}
        </motion.div>

        {/* Back link */}
        <motion.div variants={fadeUp} className="mt-6">
          <Link
            href="/booking"
            className="text-xs font-archivo text-text-secondary underline underline-offset-2 transition hover:text-accent"
          >
            &larr; {t("booking.back_daftar")}
          </Link>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
