"use client";

import { motion } from "framer-motion";
import { Tent, ArrowLeft, RefreshCw, PhoneCall, Check, Clock, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageShell from "../../../components/PageShell";
import { staggerContainer, fadeUp, scaleIn, spring } from "../../../lib/animations";

type BookingStatus = "active" | "completed" | "waiting" | "cancelled";

const statusConfig: Record<
  BookingStatus,
  { label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }
> = {
  active: {
    label: "Sedang Berlangsung",
    desc: "Alat sedang kamu sewa. Nikmati petualanganmu!",
    icon: AlertCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  completed: {
    label: "Selesai",
    desc: "Penyewaan telah selesai. Terima kasih!",
    icon: Check,
    color: "text-moss-light",
    bg: "bg-moss-light/10",
  },
  waiting: {
    label: "Menunggu Konfirmasi",
    desc: "Pesananmu sedang diproses oleh mitra penyedia.",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  cancelled: {
    label: "Dibatalkan",
    desc: "Penyewaan ini telah dibatalkan.",
    icon: X,
    color: "text-red",
    bg: "bg-red/10",
  },
};

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

export default function StatusPembayaranPage() {
  const params = useParams();

  const status: BookingStatus = "active" as BookingStatus;
  const config = statusConfig[status];
  const Icon = config.icon;

  const mockDetail = {
    equipment: "Tenda Dome Consina 4P",
    category: "Tenda",
    startDate: "12 Jul 2026",
    endDate: "15 Jul 2026",
    total: 105000,
  };

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
          {config.label}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-text-secondary">
          {config.desc}
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
              <p className="truncate text-sm font-semibold text-text-primary">{mockDetail.equipment}</p>
              <p className="text-xs text-text-secondary">{mockDetail.category}</p>
            </div>
          </div>

          <hr className="my-3 border-surface-border" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Tanggal Sewa</span>
              <span className="font-mono text-text-primary">
                {mockDetail.startDate} &ndash; {mockDetail.endDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Total</span>
              <span className="font-mono font-semibold text-accent">{formatPrice(mockDetail.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* CTAs based on status */}
        <motion.div variants={fadeUp} className="mt-8 space-y-3">
          {status === "active" && (
            <Link href="/booking">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={spring}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
              >
                <ArrowLeft size={18} />
                Lihat Booking Saya
              </motion.div>
            </Link>
          )}

          {status === "completed" && (
            <>
              <Link href="/katalog">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
                >
                  Sewa Lagi
                </motion.div>
              </Link>
              <Link href="/booking">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent"
                >
                  Riwayat Booking
                </motion.div>
              </Link>
            </>
          )}

          {status === "waiting" && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              <RefreshCw size={18} />
              Cek Status
            </motion.button>
          )}

          {status === "cancelled" && (
            <>
              <Link href="/katalog">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
                >
                  <RefreshCw size={18} />
                  Booking Ulang
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={spring}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent"
              >
                <PhoneCall size={18} />
                Hubungi Admin
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Back link */}
        <motion.div variants={fadeUp} className="mt-6">
          <Link
            href="/booking"
            className="text-xs font-mono text-text-secondary underline underline-offset-2 transition hover:text-accent"
          >
            &larr; Kembali ke daftar booking
          </Link>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
