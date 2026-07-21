"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, Tent, ArrowLeft, RefreshCw, PhoneCall } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageShell from "../../../components/PageShell";
import { staggerContainer, fadeUp, scaleIn, spring } from "../../../lib/animations";

type PaymentStatus = "success" | "pending" | "failed";

// ── Config ──

const statusConfig: Record<
  PaymentStatus,
  { label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  success: {
    label: "Pembayaran Berhasil",
    desc: "Terima kasih! Pesanan kamu sudah terkonfirmasi.",
    icon: CheckCircle,
    color: "text-moss-light",
  },
  pending: {
    label: "Menunggu Pembayaran",
    desc: "Silakan selesaikan pembayaran dalam 1x24 jam.",
    icon: Clock,
    color: "text-amber",
  },
  failed: {
    label: "Pembayaran Gagal",
    desc: "Pembayaran tidak dapat diproses. Silakan coba lagi atau hubungi admin.",
    icon: XCircle,
    color: "text-red",
  },
};

// ── Helpers ──

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

// ── Page ──

export default function StatusPembayaranPage() {
  const params = useParams();

  // Mock — change to test different states: "success" | "pending" | "failed"
  const status: PaymentStatus = "success" as PaymentStatus;
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
        {/* ── Large animated icon ── */}
        <motion.div variants={scaleIn} className="mx-auto mb-6">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-bg-elevated">
            <Icon size={52} className={config.color} />
          </div>
        </motion.div>

        {/* ── Status label ── */}
        <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-text-primary">
          {config.label}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-text-secondary">
          {config.desc}
        </motion.p>

        {/* ── Booking summary ── */}
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

        {/* ── CTAs based on status ── */}
        <motion.div variants={fadeUp} className="mt-8 space-y-3">
          {status === "success" && (
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

          {status === "pending" && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              <RefreshCw size={18} />
              Coba Lagi
            </motion.button>
          )}

          {status === "failed" && (
            <>
              <Link href="/booking">
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

        {/* ── Back link for all statuses ── */}
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
