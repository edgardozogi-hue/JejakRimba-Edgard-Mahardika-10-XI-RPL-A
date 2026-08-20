"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import PageShell from "../../components/PageShell";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { useCart } from "../../lib/cart";

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function KeranjangPage() {
  const { items, itemCount, totalPerDay, setQuantity, removeItem } = useCart();
  const router = useRouter();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const today = todayLocal();

  const days = useMemo(() => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
  }, [start, end]);

  const totalForAllDays = days * totalPerDay;

  function handleCheckout() {
    if (!start || !end) {
      setDateError("Pilih tanggal ambil dan kembali terlebih dahulu.");
      return;
    }
    if (new Date(end) < new Date(start)) {
      setDateError("Tanggal kembali harus setelah tanggal ambil.");
      return;
    }
    setDateError(null);
    router.push(`/booking/checkout?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  }

  return (
    <PageShell>
      <motion.div
        className="mx-auto max-w-3xl px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <Link
            href="/katalog"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            Lanjut belanja
          </Link>
          <p className="font-archivo text-xs tracking-wide text-accent">SEWA BANYAK ALAT</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            Keranjang Sewa
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gabungkan beberapa alat dalam satu booking dengan satu periode sewa.
          </p>
        </motion.div>

        {items.length === 0 ? (
          /* Empty state */
          <motion.div variants={fadeUp} className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
              <ShoppingCart size={32} className="text-text-secondary" />
            </div>
            <p className="font-display text-lg font-semibold text-text-primary">
              Keranjang masih kosong
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Tambahkan alat dari katalog untuk mulai menyewa bersama.
            </p>
            <Link href="/katalog">
              <span className="mt-5 inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover">
                Jelajahi Katalog
              </span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Item list */}
            <motion.div variants={fadeUp} className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.equipmentId}
                  className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <ShoppingCart size={20} className="text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-text-primary">
                      {item.name}
                    </p>
                    <p className="font-archivo text-xs text-text-secondary">
                      {formatPrice(item.pricePerDay)} /hari &times; {item.quantity}
                    </p>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-bg p-1">
                    <button
                      type="button"
                      aria-label="Kurangi jumlah"
                      disabled={item.quantity <= 1}
                      onClick={() => setQuantity(item.equipmentId, item.quantity - 1)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center font-archivo text-sm tabular-nums text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah jumlah"
                      disabled={item.quantity >= item.stock}
                      onClick={() => setQuantity(item.equipmentId, item.quantity + 1)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="Hapus dari keranjang"
                    onClick={() => removeItem(item.equipmentId)}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition hover:bg-red/10 hover:text-red"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </motion.div>

            {/* Date range */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-surface-border bg-surface p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays size={16} className="text-accent" />
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Periode Sewa
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
                    Tanggal Ambil
                  </label>
                  <input
                    type="date"
                    value={start}
                    min={today}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStart(v);
                      setDateError(null);
                      // Jika tanggal ambil pindah setelah tanggal kembali,
                      // reset tanggal kembali agar selalu valid (end >= start).
                      if (v && end && new Date(end) < new Date(v)) {
                        setEnd(v);
                      }
                    }}
                    className="w-full rounded-xl border border-surface-border bg-bg px-3 py-[11px] font-archivo text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
                    Tanggal Kembali
                  </label>
                  <input
                    type="date"
                    value={end}
                    min={start || today}
                    onChange={(e) => { setEnd(e.target.value); setDateError(null); }}
                    className="w-full rounded-xl border border-surface-border bg-bg px-3 py-[11px] font-archivo text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>
              {days > 0 && (
                <p className="mt-3 font-archivo text-xs text-text-secondary">
                  Durasi {days} hari
                </p>
              )}
              {dateError && (
                <p className="mt-2 text-xs font-display text-red">{dateError}</p>
              )}
            </motion.div>

            {/* Summary */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-surface-border bg-surface p-5"
            >
              <div className="flex items-center justify-between font-display text-sm">
                <span className="text-text-secondary">{itemCount} alat (total)</span>
                <span className="font-archivo text-text-primary">
                  {formatPrice(totalPerDay)} /hari
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between font-display text-sm">
                <span className="text-text-secondary">
                  {days > 0 ? `${days} hari` : "Durasi belum dipilih"}
                </span>
                <span className="font-archivo text-text-primary">
                  {days > 0 ? `= ${formatPrice(totalForAllDays)}` : "\u2014"}
                </span>
              </div>
              <hr className="my-3 border-surface-border" />
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-text-primary">
                  Total Bayar
                </span>
                <span className="font-archivo text-xl font-bold text-accent">
                  {days > 0 ? formatPrice(totalForAllDays) : "\u2014"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={itemCount === 0}
                className="mt-5 w-full cursor-pointer rounded-xl bg-accent px-6 py-[15px] font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {days === 0 ? "Pilih Tanggal Dulu" : `Lanjut ke Checkout`}
                  {days > 0 && <ArrowRight size={18} />}
                </span>
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}