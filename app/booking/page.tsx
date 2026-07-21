"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import PageShell from "../components/PageShell";
import { staggerContainer, fadeUp, spring } from "../lib/animations";

// ── Mock data ──

const mockBookings = [
  {
    id: "BK-001",
    equipment: "Tenda Dome Consina 4P",
    category: "Tenda",
    startDate: "12 Jul 2026",
    endDate: "15 Jul 2026",
    total: 105000,
    status: "active" as const,
    image: "/placeholders/tenda.svg",
  },
  {
    id: "BK-002",
    equipment: "Carrier Avtech 60L",
    category: "Carrier",
    startDate: "20 Jul 2026",
    endDate: "22 Jul 2026",
    total: 40000,
    status: "completed" as const,
    image: "/placeholders/carrier.svg",
  },
  {
    id: "BK-003",
    equipment: "Sleeping Bag Naturehike",
    category: "Sleeping Bag",
    startDate: "5 Agu 2026",
    endDate: "8 Agu 2026",
    total: 45000,
    status: "pending" as const,
    image: "/placeholders/sleeping-bag.svg",
  },
  {
    id: "BK-004",
    equipment: "Kompor Portable + Gas",
    category: "Kompor",
    startDate: "10 Agu 2026",
    endDate: "11 Agu 2026",
    total: 12000,
    status: "cancelled" as const,
    image: "/placeholders/kompor.svg",
  },
];

type BookingStatus = "active" | "completed" | "pending" | "cancelled";

// ── Config ──

const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  active: { label: "Aktif", bg: "bg-accent/15", text: "text-accent", icon: Circle },
  completed: { label: "Selesai", bg: "bg-moss/15", text: "text-moss-light", icon: CalendarCheck },
  pending: { label: "Menunggu", bg: "bg-amber/15", text: "text-amber", icon: Clock },
  cancelled: { label: "Dibatalkan", bg: "bg-red/15", text: "text-red", icon: XCircle },
};

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Tenda: Tent,
  Carrier: Backpack,
  "Sleeping Bag": Package,
  Kompor: Mountain,
};

// ── Helpers ──

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

// ── Page ──

export default function BookingSayaPage() {
  const bookings = mockBookings;

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
          <p className="font-mono text-xs tracking-wide text-accent">BOOKING SAYA</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">Riwayat Sewa</h1>
        </motion.div>

        {/* Empty state */}
        {bookings.length === 0 ? (
          <motion.div variants={fadeUp} className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
              <Package size={32} className="text-text-secondary" />
            </div>
            <p className="font-display text-lg font-semibold text-text-primary">Belum ada booking</p>
            <p className="mt-1 text-sm text-text-secondary">
              Sewa alat pertamamu sekarang dan mulai petualangan!
            </p>
          </motion.div>
        ) : (
          /* Booking grid */
          <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status];
              const Icon = categoryIcons[booking.category] ?? Package;

              return (
                <motion.div key={booking.id} variants={fadeUp}>
                  <Link href={`/booking/${booking.id}/status`} className="block">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={spring}
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
                            {booking.equipment}
                          </p>
                          <p className="mt-0.5 text-xs text-text-secondary">{booking.category}</p>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                            <CalendarCheck size={12} className="shrink-0" />
                            <span className="font-mono">
                              {booking.startDate} &ndash; {booking.endDate}
                            </span>
                          </div>

                          <p className="mt-1 font-mono text-sm font-semibold text-accent">
                            {formatPrice(booking.total)}
                          </p>
                        </div>

                        {/* Status + chevron */}
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.bg} ${status.text}`}
                          >
                            {booking.status === "active" ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            ) : (
                              <status.icon size={12} />
                            )}
                            {status.label}
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
