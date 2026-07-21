"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  CalendarDays,
  FileText,
  Clock,
  ShoppingCart,
  AlertTriangle,
  MapPin,
  Building2,
  ChevronRight,
  Check,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageShell from "../../components/PageShell";
import { equipmentList } from "../../lib/data";
import { staggerContainer, fadeUp, spring } from "../../lib/animations";

// ── Helpers ──

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

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

const categoryImageMap: Record<string, string> = {
  Tenda: "/placeholders/tenda.svg",
  Carrier: "/placeholders/carrier.svg",
  "Sleeping Bag": "/placeholders/sleeping-bag.svg",
  Kompor: "/placeholders/kompor.svg",
  Matras: "/placeholders/matras.svg",
  Jaket: "/placeholders/jaket.svg",
};

// ── Booking Step Indicator ──

const steps = [
  { num: 1, label: "Tanggal" },
  { num: 2, label: "Data" },
  { num: 3, label: "Konfirmasi" },
];

function StepIndicator({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          {/* Circle + label */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                s.num <= active
                  ? "bg-accent text-paper shadow-sm shadow-accent/30"
                  : "bg-surface text-text-secondary ring-1 ring-surface-border"
              }`}
            >
              {s.num < active ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                s.num
              )}
            </div>
            <span
              className={`font-display text-[10px] font-semibold transition-colors ${
                s.num === active ? "text-accent" : "text-text-secondary"
              }`}
            >
              {s.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="mx-2 mb-5 h-px w-12 sm:w-16 md:w-20">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  s.num < active
                    ? "bg-accent"
                    : "bg-surface-border"
                }`}
                style={{ height: 2 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ──

export default function BookingFormPage() {
  const params = useParams();

  const equipment = useMemo(
    () => equipmentList.find((e) => e.id === params.id),
    [params.id],
  );

  const today = getToday();

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [tanggalAmbil, setTanggalAmbil] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [catatan, setCatatan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading] = useState(false);

  const days = useMemo(
    () => calcDays(tanggalAmbil, tanggalKembali),
    [tanggalAmbil, tanggalKembali],
  );

  const total = useMemo(
    () => (equipment ? days * equipment.pricePerDay : 0),
    [days, equipment],
  );

  const hasDates = tanggalAmbil && tanggalKembali && days > 0;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!nama.trim()) errs.nama = "Nama lengkap wajib diisi";
    if (!noHp.trim()) errs.noHp = "No HP wajib diisi";
    if (!tanggalAmbil) errs.tanggalAmbil = "Tanggal ambil wajib diisi";
    if (!tanggalKembali) errs.tanggalKembali = "Tanggal kembali wajib diisi";
    if (
      tanggalAmbil &&
      tanggalKembali &&
      new Date(tanggalKembali) < new Date(tanggalAmbil)
    ) {
      errs.tanggalKembali = "Tanggal kembali harus setelah tanggal ambil";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goToKonfirmasi() {
    if (!validate() || !equipment) return;
    const qs = new URLSearchParams({
      start: tanggalAmbil,
      end: tanggalKembali,
      days: String(days || 1),
    });
    window.location.href = `/booking/${equipment.id}/konfirmasi?${qs}`;
  }

  function clearError(field: string) {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  // ── Loading skeleton ──

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-border" />
          <div className="mt-6 grid gap-8 lg:grid-cols-5">
            <div className="space-y-5 lg:col-span-3">
              <div className="h-28 animate-pulse rounded-2xl bg-surface" />
              <div className="h-80 animate-pulse rounded-2xl bg-surface" />
            </div>
            <div className="lg:col-span-2">
              <div className="h-72 animate-pulse rounded-2xl bg-surface" />
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── 404 state ──

  if (!equipment) {
    return (
      <PageShell>
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
              Alat dengan ID &ldquo;{params.id}&rdquo; tidak ditemukan. Mungkin
              sudah dihapus atau tautan tidak valid.
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

  // ── Main form ──

  const imgSrc = categoryImageMap[equipment.category] ?? "/placeholders/tenda.svg";

  return (
    <PageShell>
      <motion.div
        className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:max-w-6xl"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* ── Back link ── */}
        <motion.div variants={fadeUp}>
          <Link
            href="/katalog"
            className="mb-4 inline-flex items-center gap-1.5 font-display text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            Kembali ke katalog
          </Link>
        </motion.div>

        {/* ── Header + Stepper row (desktop) ── */}
        <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">BOOKING</p>
            <h1 className="mt-0.5 font-display text-2xl font-bold text-text-primary lg:text-3xl">
              Sewa Alat Camping
            </h1>
            <p className="mt-1 font-display text-sm text-text-secondary">
              Isi data diri dan pilih tanggal sewa
            </p>
          </div>
          <div className="rounded-2xl bg-surface px-6 py-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10 lg:px-10">
            <StepIndicator active={1} />
          </div>
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ══ Left column: Form (7/12) ══ */}
          <motion.div variants={fadeUp} className="space-y-6 lg:col-span-7">
            {/* ── Section: Pilih Tanggal ── */}
            <div className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3 border-b border-surface-border px-5 py-4 lg:px-7 lg:py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 lg:h-10 lg:w-10">
                  <CalendarDays size={18} className="text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-text-primary lg:text-lg">
                    Pilih Tanggal Sewa
                  </h2>
                  <p className="font-display text-xs text-text-secondary">
                    Tentukan durasi peminjaman alat
                  </p>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5 lg:px-7 lg:py-6">
                {/* Equipment info mini - desktop larger */}
                <div className="flex items-center gap-4 rounded-xl bg-bg-elevated p-3 lg:p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface lg:h-16 lg:w-16">
                    <img
                      src={imgSrc}
                      alt={equipment.name}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold text-text-primary text-sm lg:text-base">
                      {equipment.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 font-display text-[10px] font-semibold tracking-wide text-accent lg:text-xs">
                        {equipment.category}
                      </span>
                      <span className="font-display text-xs text-text-secondary lg:text-sm">
                        {formatPrice(equipment.pricePerDay)}
                        <span className="text-[10px] lg:text-xs">/hari</span>
                      </span>
                    </div>
                  </div>
                  {/* Stock badge - desktop only */}
                  <div className="hidden shrink-0 lg:block">
                    <div className="rounded-lg border border-surface-border px-3 py-1.5 text-center">
                      <p className="font-display text-lg font-bold text-moss">{equipment.stock}</p>
                      <p className="font-display text-[10px] text-text-secondary">Tersedia</p>
                    </div>
                  </div>
                </div>

                {/* Date inputs side by side */}
                <div className="grid grid-cols-2 gap-3 lg:gap-5">
                  <div>
                    <label
                      htmlFor="tanggalAmbil"
                      className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary lg:text-sm"
                    >
                      Tanggal Ambil
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary lg:left-4"
                      />
                      <input
                        id="tanggalAmbil"
                        type="date"
                        value={tanggalAmbil}
                        onChange={(e) => {
                          setTanggalAmbil(e.target.value);
                          clearError("tanggalAmbil");
                        }}
                        min={today}
                        className={`w-full rounded-xl border bg-bg py-[13px] pl-10 pr-3 font-display text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 [color-scheme:light] dark:[color-scheme:dark] lg:py-3.5 lg:pl-11 lg:text-base ${
                          errors.tanggalAmbil ? "border-red" : "border-surface-border"
                        }`}
                      />
                    </div>
                    {errors.tanggalAmbil && (
                      <p className="mt-1 text-xs font-display text-red">{errors.tanggalAmbil}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="tanggalKembali"
                      className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary lg:text-sm"
                    >
                      Tanggal Kembali
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary lg:left-4"
                      />
                      <input
                        id="tanggalKembali"
                        type="date"
                        value={tanggalKembali}
                        onChange={(e) => {
                          setTanggalKembali(e.target.value);
                          clearError("tanggalKembali");
                        }}
                        min={tanggalAmbil || today}
                        className={`w-full rounded-xl border bg-bg py-[13px] pl-10 pr-3 font-display text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 [color-scheme:light] dark:[color-scheme:dark] lg:py-3.5 lg:pl-11 lg:text-base ${
                          errors.tanggalKembali
                            ? "border-red"
                            : "border-surface-border"
                        }`}
                      />
                    </div>
                    {errors.tanggalKembali && (
                      <p className="mt-1 text-xs font-display text-red">{errors.tanggalKembali}</p>
                    )}
                  </div>
                </div>

                {/* Durasi indicator */}
                <AnimatePresence>
                  {hasDates && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex flex-col gap-1.5 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 lg:h-8 lg:w-8">
                          <Clock size={14} className="text-accent" />
                        </div>
                        <span className="font-display text-sm text-text-primary lg:text-base">
                          Durasi sewa:{" "}
                          <span className="font-bold text-accent">{days} hari</span>
                        </span>
                      </div>
                      <span className="font-display text-xs text-text-secondary lg:text-sm">
                        {formatDate(tanggalAmbil)} — {formatDate(tanggalKembali)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Section: Data Penyewa ── */}
            <div className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3 border-b border-surface-border px-5 py-4 lg:px-7 lg:py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 lg:h-10 lg:w-10">
                  <User size={18} className="text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-text-primary lg:text-lg">
                    Data Penyewa
                  </h2>
                  <p className="font-display text-xs text-text-secondary">
                    Informasi kontak peminjam
                  </p>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5 lg:px-7 lg:py-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label
                      htmlFor="nama"
                      className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary lg:text-sm"
                    >
                      Nama Lengkap <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary lg:left-4"
                      />
                      <input
                        id="nama"
                        type="text"
                        value={nama}
                        onChange={(e) => {
                          setNama(e.target.value);
                          clearError("nama");
                        }}
                        placeholder="Masukkan nama lengkap"
                        className={`w-full rounded-xl border bg-bg py-[13px] pl-10 pr-4 font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-2 focus:ring-accent/20 lg:py-3.5 lg:pl-11 lg:text-base ${
                          errors.nama ? "border-red" : "border-surface-border"
                        }`}
                      />
                    </div>
                    {errors.nama && (
                      <p className="mt-1 text-xs font-display text-red">{errors.nama}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="noHp"
                      className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary lg:text-sm"
                    >
                      No HP <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary lg:left-4"
                      />
                      <input
                        id="noHp"
                        type="tel"
                        value={noHp}
                        onChange={(e) => {
                          setNoHp(e.target.value);
                          clearError("noHp");
                        }}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full rounded-xl border bg-bg py-[13px] pl-10 pr-4 font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-2 focus:ring-accent/20 lg:py-3.5 lg:pl-11 lg:text-base ${
                          errors.noHp ? "border-red" : "border-surface-border"
                        }`}
                      />
                    </div>
                    {errors.noHp && (
                      <p className="mt-1 text-xs font-display text-red">{errors.noHp}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="catatan"
                    className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary lg:text-sm"
                  >
                    Catatan
                    <span className="ml-1 text-xs font-normal text-text-secondary">(opsional)</span>
                  </label>
                  <div className="relative">
                    <FileText
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-3.5 shrink-0 text-text-secondary lg:left-4 lg:top-4"
                    />
                    <textarea
                      id="catatan"
                      rows={3}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Catatan tambahan (misal: request waktu ambil)"
                      className="w-full resize-none rounded-xl border border-surface-border bg-bg py-[13px] pl-10 pr-4 font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-2 focus:ring-accent/20 lg:py-3.5 lg:pl-11 lg:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ══ Right column: Summary sidebar (5/12) ══ */}
          <motion.div variants={fadeUp} className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-24">
              <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                {/* Header with accent */}
                <div className="relative bg-accent px-7 py-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/90 to-accent" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <ShoppingCart size={20} className="text-paper" />
                    </div>
                    <div>
                      <h2 className="font-display text-base font-semibold text-paper">
                        Ringkasan Pesanan
                      </h2>
                      <p className="font-display text-xs text-paper/70">
                        {hasDates ? "Review sebelum lanjut" : "Belum ada tanggal dipilih"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-0">
                  {/* Equipment card */}
                  <div className="border-b border-surface-border px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bg-elevated">
                        <img
                          src={imgSrc}
                          alt={equipment.name}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold text-text-primary">
                          {equipment.name}
                        </p>
                        <span className="mt-1 inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 font-display text-[10px] font-semibold tracking-wide text-accent">
                          {equipment.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info lokasi */}
                  <div className="border-b border-surface-border px-7 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-text-secondary" />
                        <span className="font-display text-sm text-text-secondary">
                          Pengambilan di{" "}
                          <span className="font-semibold text-text-primary">{equipment.location}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="shrink-0 text-text-secondary" />
                        <span className="font-display text-sm text-text-secondary">
                          Penyedia:{" "}
                          <span className="font-semibold text-text-primary">{equipment.provider}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Empty state */}
                  {!hasDates && (
                    <div className="px-7 py-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated">
                        <CalendarDays size={24} className="text-text-secondary" />
                      </div>
                      <p className="mt-3 font-display text-sm font-medium text-text-primary">
                        Pilih Tanggal Sewa
                      </p>
                      <p className="mt-1 font-display text-xs text-text-secondary">
                        Tentukan tanggal ambil dan kembali untuk melihat rincian biaya
                      </p>
                    </div>
                  )}

                  {/* Detail harga */}
                  <AnimatePresence>
                    {hasDates && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0">
                          {/* Price breakdown */}
                          <div className="space-y-3 px-7 py-5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-display text-sm text-text-secondary">
                                <Clock size={14} />
                                Durasi Sewa
                              </span>
                              <span className="font-display text-sm font-semibold text-text-primary">
                                {days} hari
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-display text-sm text-text-secondary">
                                {formatPrice(equipment.pricePerDay)} × {days} hari
                              </span>
                              <span className="font-display text-sm font-semibold text-text-primary">
                                {formatPrice(total)}
                              </span>
                            </div>
                          </div>

                          {/* Divider with label */}
                          <div className="relative px-7">
                            <hr className="border-surface-border" />
                          </div>

                          {/* Total */}
                          <div className="flex items-center justify-between px-7 py-5">
                            <span className="font-display text-base font-bold text-text-primary">
                              Total
                            </span>
                            <span className="font-display text-2xl font-bold text-accent">
                              {formatPrice(total)}
                            </span>
                          </div>

                          {/* Date range summary */}
                          <div className="border-t border-surface-border bg-bg-elevated/50 px-7 py-3">
                            <div className="flex items-center justify-between font-display text-xs text-text-secondary">
                              <span>Ambil: {formatDate(tanggalAmbil)}</span>
                              <span>Kembali: {formatDate(tanggalKembali)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA */}
                <div className="border-t border-surface-border px-7 py-5">
                  <motion.button
                    onClick={goToKonfirmasi}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
                  >
                    Lanjut ke Konfirmasi
                    <ChevronRight size={18} />
                  </motion.button>
                  {hasDates && (
                    <p className="mt-2 text-center font-display text-[11px] text-text-secondary">
                      Data pemesanan dapat diubah sebelum konfirmasi akhir
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══ Mobile Inline CTA (lg:hidden) ══ */}
        <div className="mt-6 lg:hidden">
          <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xs text-text-secondary">Total Sewa</p>
                <p className="font-display text-xl font-bold text-accent">
                  {hasDates ? formatPrice(total) : "\u2014"}
                </p>
                {hasDates && (
                  <p className="font-display text-[11px] text-text-secondary">
                    {days} hari x {formatPrice(equipment.pricePerDay)}
                  </p>
                )}
              </div>
              <motion.button
                onClick={goToKonfirmasi}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent px-6 py-3 font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
              >
                Lanjut
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </div>

      </motion.div>
    </PageShell>
  );
}
