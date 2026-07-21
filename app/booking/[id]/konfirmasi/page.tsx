"use client";

import { Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Tent,
  Calendar,
  User,
  Phone,
  FileText,
  Clock,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import PageShell from "../../../components/PageShell";
import { equipmentList } from "../../../lib/data";
import { staggerContainer, fadeUp, spring } from "../../../lib/animations";

// ── Helpers ──

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Inner component (needs Suspense for useSearchParams) ──

function KonfirmasiContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";
  const daysStr = searchParams.get("days") ?? "0";
  const days = parseInt(daysStr, 10) || 0;

  const equipment = useMemo(
    () => equipmentList.find((e) => e.id === params.id),
    [params.id],
  );

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [catatan, setCatatan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = useMemo(
    () => (equipment ? days * equipment.pricePerDay : 0),
    [days, equipment],
  );

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!nama.trim()) errs.nama = "Nama lengkap wajib diisi";
    if (!noHp.trim()) errs.noHp = "No HP wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleBayar() {
    if (!validate() || !equipment) return;
    const qs = new URLSearchParams({
      nama: nama.trim(),
      hp: noHp.trim(),
      start,
      end,
      days: String(days),
      equipment: equipment.id,
    });
    window.location.href = `/booking/${equipment.id}/status?${qs}`;
  }

  // ── 404 state ──

  if (!equipment) {
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
              <AlertTriangle size={40} className="text-text-secondary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text-primary">
              Alat Tidak Ditemukan
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Alat dengan ID &ldquo;{params.id}&rdquo; tidak ditemukan.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/katalog">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={spring}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
              >
                <ArrowLeft size={18} />
                Lihat Katalog
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </PageShell>
    );
  }

  // ── Main content ──

  return (
    <PageShell showNav={false}>
      <motion.div
        className="mx-auto max-w-5xl px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* ── Page header ── */}
        <motion.div variants={fadeUp} className="mb-6">
          <Link
            href={`/booking/${equipment.id}`}
            className="mb-3 inline-flex items-center gap-1.5 font-display text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
            KONFIRMASI PESANAN
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            Lengkapi Data Sewa
          </h1>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* ── Left column: Form ── */}
          <motion.div variants={fadeUp} className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <User size={16} className="text-accent" />
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Data Penyewa
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="konf-nama"
                    className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary"
                  >
                    Nama Lengkap <span className="text-red">*</span>
                  </label>
                  <input
                    id="konf-nama"
                    type="text"
                    value={nama}
                    onChange={(e) => {
                      setNama(e.target.value);
                      if (errors.nama) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.nama;
                          return next;
                        });
                      }
                    }}
                    placeholder="Masukkan nama lengkap"
                    className={`w-full rounded-xl border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/30 ${
                      errors.nama ? "border-red" : "border-surface-border"
                    }`}
                  />
                  {errors.nama && (
                    <p className="mt-1 text-xs font-display text-red">{errors.nama}</p>
                  )}
                </div>

                {/* No HP */}
                <div>
                  <label
                    htmlFor="konf-hp"
                    className="flex items-center gap-1.5 text-sm font-medium text-text-primary"
                  >
                    <Phone size={14} className="text-text-secondary" />
                    No HP <span className="text-red">*</span>
                  </label>
                  <input
                    id="konf-hp"
                    type="tel"
                    value={noHp}
                    onChange={(e) => {
                      setNoHp(e.target.value);
                      if (errors.noHp) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.noHp;
                          return next;
                        });
                      }
                    }}
                    placeholder="08xxxxxxxxxx"
                    className={`w-full rounded-xl border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/30 ${
                      errors.noHp ? "border-red" : "border-surface-border"
                    }`}
                  />
                  {errors.noHp && (
                    <p className="mt-1 text-xs font-display text-red">{errors.noHp}</p>
                  )}
                </div>

                {/* Tanggal - side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
                      Tanggal Ambil
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-bg px-4 py-[13px]">
                      <Calendar size={14} className="shrink-0 text-text-secondary" />
                      <span className="font-display text-sm text-text-primary">
                        {start ? formatDate(start) : "\u2014"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
                      Tanggal Kembali
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-bg px-4 py-[13px]">
                      <Calendar size={14} className="shrink-0 text-text-secondary" />
                      <span className="font-display text-sm text-text-primary">
                        {end ? formatDate(end) : "\u2014"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label
                    htmlFor="konf-catatan"
                    className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary"
                  >
                    Catatan
                    <span className="ml-1 text-xs font-normal text-text-secondary">
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    id="konf-catatan"
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Catatan tambahan (opsional)"
                    className="w-full resize-none rounded-xl border border-surface-border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="mt-5 lg:hidden">
                <div className="mb-3 rounded-xl bg-bg-elevated p-4">
                  <div className="flex items-center justify-between font-display text-sm">
                    <span className="text-text-secondary">Total</span>
                    <span className="font-display text-lg font-bold text-accent">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
                    <span>{days} hari</span>
                    <span>{formatPrice(equipment.pricePerDay)}/hari</span>
                  </div>
                </div>
                <motion.button
                  onClick={handleBayar}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  className="w-full cursor-pointer rounded-xl bg-accent px-6 py-[15px] font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
                >
                  Konfirmasi &amp; Bayar
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── Right column: Ringkasan (desktop only) ── */}
          <motion.div variants={fadeUp} className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-24 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 border-b border-surface-border pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Tent size={16} className="text-accent" />
                </div>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Ringkasan Pesanan
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {/* Equipment */}
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-text-primary">
                    {equipment.name}
                  </p>
                  <p className="font-display text-xs text-text-secondary">
                    {equipment.category}
                  </p>
                </div>

                <hr className="border-surface-border" />

                {/* Durasi */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-display text-sm text-text-secondary">
                    <Clock size={14} />
                    Durasi Sewa
                  </span>
                  <span className="font-display text-sm font-semibold text-text-primary">
                    {days} hari
                  </span>
                </div>

                {/* Harga per hari */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm text-text-secondary">
                    Harga per hari
                  </span>
                  <span className="font-display text-sm font-semibold text-text-primary">
                    {formatPrice(equipment.pricePerDay)}
                  </span>
                </div>

                <hr className="border-surface-border" />

                {/* Tanggal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-display text-xs">
                    <span className="text-text-secondary">Ambil</span>
                    <span className="font-semibold text-text-primary">
                      {start ? formatDate(start) : "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-display text-xs">
                    <span className="text-text-secondary">Kembali</span>
                    <span className="font-semibold text-text-primary">
                      {end ? formatDate(end) : "\u2014"}
                    </span>
                  </div>
                </div>

                <hr className="border-surface-border" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-text-primary">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-accent">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleBayar}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                className="mt-5 w-full cursor-pointer rounded-xl bg-accent px-6 py-[15px] font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
              >
                Konfirmasi &amp; Bayar
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}

// ── Wrapper with Suspense (required for useSearchParams) ──

export default function KonfirmasiPage() {
  return (
    <Suspense
      fallback={
        <PageShell showNav={false}>
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-border" />
            <div className="mt-6 grid gap-8 lg:grid-cols-5">
              <div className="space-y-5 lg:col-span-3">
                <div className="h-80 animate-pulse rounded-2xl bg-surface" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-72 animate-pulse rounded-2xl bg-surface" />
              </div>
            </div>
          </div>
        </PageShell>
      }
    >
      <KonfirmasiContent />
    </Suspense>
  );
}
