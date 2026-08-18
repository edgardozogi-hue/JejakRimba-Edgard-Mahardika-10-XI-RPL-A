"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEquipmentById } from "../../actions/equipment";
import type { EquipmentFrontend } from "../../lib/database.types";
import PageShell from "../../components/PageShell";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { useLanguage } from "../../lib/i18n";
import { getProfileWithPrefs } from "../../actions/profile";
import { RenterSwitchModal } from "../../components/profile/RenterSwitchModal";

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

// ── Animated Price Counter ──

function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });
  const rounded = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return <span className={className}>{formatPrice(display)}</span>;
}

// ── Booking Step Indicator ──

const steps = [
  { num: 1, labelKey: "booking.step_date" },
  { num: 2, labelKey: "booking.step_data" },
  { num: 3, labelKey: "booking.step_confirm" },
];

function StepIndicator({ active }: { active: number }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          {/* Circle + label */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                s.num <= active
                  ? "bg-accent text-paper"
                  : "bg-surface text-text-secondary ring-1 ring-surface-border"
              }`}
              animate={
                s.num === active
                  ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(196,98,45,0.4)",
                        "0 0 0 8px rgba(196,98,45,0)",
                        "0 0 0 0 rgba(196,98,45,0)",
                      ],
                    }
                  : {}
              }
              transition={
                s.num === active
                  ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  : {}
              }
            >
              {s.num < active ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                s.num
              )}
            </motion.div>
            <span
              className={`font-display text-[10px] font-semibold transition-colors ${
                s.num === active ? "text-accent" : "text-text-secondary"
              }`}
            >
              {t(s.labelKey)}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="mx-2 mb-5 h-px w-12 sm:w-16 md:w-20">
              <motion.div
                className="h-full rounded-full"
                animate={{
                  backgroundColor:
                    s.num < active
                      ? "#c4622d"
                      : "var(--surface-border, rgba(26,23,20,0.12))",
                  height: s.num < active ? 3 : 2,
                }}
                transition={{ duration: 0.4 }}
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
  const { t } = useLanguage();

  const [equipment, setEquipment] = useState<EquipmentFrontend | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    getEquipmentById(params.id as string).then((data) => {
      setEquipment(data);
      setPageLoading(false);
    });
  }, [params.id]);

  const today = getToday();

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [tanggalAmbil, setTanggalAmbil] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [catatan, setCatatan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRenterModal, setShowRenterModal] = useState(false);

  useEffect(() => {
    getProfileWithPrefs().then((res) => {
      setUserRole(res.profile?.role ?? null);
    });
  }, []);

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
    if (!nama.trim()) errs.nama = t("booking.err_nama");
    if (!noHp.trim()) errs.noHp = t("booking.err_hp");
    if (!tanggalAmbil) errs.tanggalAmbil = t("booking.err_tgl_ambil");
    if (!tanggalKembali) errs.tanggalKembali = t("booking.err_tgl_kembali");
    if (
      tanggalAmbil &&
      tanggalKembali &&
      new Date(tanggalKembali) < new Date(tanggalAmbil)
    ) {
      errs.tanggalKembali = t("booking.err_tgl_urutan");
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

  if (pageLoading) {
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
              {t("booking.not_found_title")}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {t("booking.not_found_desc").replace("{id}", params.id as string)}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/katalog">
              <span
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
              >
                <ArrowLeft size={18} />
                {t("booking.lihat_katalog")}
              </span>
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
            {t("booking.back_katalog")}
          </Link>
        </motion.div>

        {/* ── Vendor → Renter alert ── */}
        {userRole === "vendor" && (
          <motion.div
            variants={fadeUp}
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-text-primary">
                  {t("booking.vendor_alert_title")}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t("booking.vendor_alert_desc")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRenterModal(true)}
              className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              {t("booking.vendor_alert_action")}
            </button>
          </motion.div>
        )}

        {/* ── Header + Stepper row (desktop) ── */}
        <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">{t("booking.kicker_short")}</p>
            <h1 className="mt-0.5 font-display text-2xl font-bold text-text-primary lg:text-3xl">
              {t("booking.sewa_title")}
            </h1>
            <p className="mt-1 font-display text-sm text-text-secondary">
              {t("booking.sewa_desc")}
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
                    {t("booking.pilih_tanggal")}
                  </h2>
                  <p className="font-display text-xs text-text-secondary">
                    {t("booking.tentukan_durasi")}
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
                        <span className="text-[10px] lg:text-xs">{t("booking.per_hari")}</span>
                      </span>
                    </div>
                  </div>
                  {/* Stock badge - desktop only */}
                  <div className="hidden shrink-0 lg:block">
                    <div className="rounded-lg border border-surface-border px-3 py-1.5 text-center">
                      <p className="font-display text-lg font-bold text-moss">{equipment.stock}</p>
                      <p className="font-display text-[10px] text-text-secondary">{t("common.available")}</p>
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
                      {t("booking.tanggal_ambil")}
                    </label>                    <div
                      className={`relative rounded-xl border bg-bg transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 ${
                        errors.tanggalAmbil ? "border-red" : "border-surface-border"
                      }`}
                    >
                      <input
                        id="tanggalAmbil"
                        type="date"
                        value={tanggalAmbil}
                        onChange={(e) => {
                          setTanggalAmbil(e.target.value);
                          clearError("tanggalAmbil");
                        }}
                        min={today}
                        className="peer w-full rounded-xl border-0 bg-transparent py-[13px] pl-3 pr-10 font-display text-sm text-text-primary outline-none transition focus:outline-none focus:ring-0 [color-scheme:light] dark:[color-scheme:dark] lg:py-3.5 lg:pl-4 lg:pr-11 lg:text-base"
                      />
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-200 peer-focus:text-accent lg:right-4"
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
                      {t("booking.tanggal_kembali")}
                    </label>
                    <div
                      className={`relative rounded-xl border bg-bg transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 ${
                        errors.tanggalKembali
                          ? "border-red"
                          : "border-surface-border"
                      }`}
                    >
                      <input
                        id="tanggalKembali"
                        type="date"
                        value={tanggalKembali}
                        onChange={(e) => {
                          setTanggalKembali(e.target.value);
                          clearError("tanggalKembali");
                        }}
                        min={tanggalAmbil || today}
                        className="peer w-full rounded-xl border-0 bg-transparent py-[13px] pl-3 pr-10 font-display text-sm text-text-primary outline-none transition focus:outline-none focus:ring-0 [color-scheme:light] dark:[color-scheme:dark] lg:py-3.5 lg:pl-4 lg:pr-11 lg:text-base"
                      />
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-200 peer-focus:text-accent lg:right-4"
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
                          {t("booking.durasi_sewa")}{" "}
                          <span className="font-bold text-accent">{days} {t("booking.hari")}</span>
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
                    {t("booking.data_penyewa")}
                  </h2>
                  <p className="font-display text-xs text-text-secondary">
                    {t("booking.info_kontak")}
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
                      {t("auth.nama_lengkap")} <span className="text-red">*</span>
                    </label>
                    <div
                      className={`relative rounded-xl border bg-bg transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 ${
                        errors.nama ? "border-red" : "border-surface-border"
                      }`}
                    >
                      <input
                        id="nama"
                        type="text"
                        value={nama}
                        onChange={(e) => {
                          setNama(e.target.value);
                          clearError("nama");
                        }}
                        placeholder={t("auth.nama_lengkap_placeholder")}
                        className="peer w-full rounded-xl border-0 bg-transparent py-[13px] pl-10 pr-4 font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:outline-none focus:ring-0 lg:py-3.5 lg:pl-11 lg:text-base"
                      />
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-200 peer-focus:text-accent lg:left-4"
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
                      {t("booking.no_hp")} <span className="text-red">*</span>
                    </label>
                    <div
                      className={`relative rounded-xl border bg-bg transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 ${
                        errors.noHp ? "border-red" : "border-surface-border"
                      }`}
                    >
                      <input
                        id="noHp"
                        type="tel"
                        value={noHp}
                        onChange={(e) => {
                          setNoHp(e.target.value);
                          clearError("noHp");
                        }}
                        placeholder={t("booking.hp_placeholder")}
                        className="peer w-full rounded-xl border-0 bg-transparent py-[13px] pl-10 pr-4 font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:outline-none focus:ring-0 lg:py-3.5 lg:pl-11 lg:text-base"
                      />
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-200 peer-focus:text-accent lg:left-4"
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
                    {t("booking.catatan")}
                    <span className="ml-1 text-xs font-normal text-text-secondary">{t("auth.opsional")}</span>
                  </label>
                  <div className="relative rounded-xl border border-surface-border bg-bg transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                    <textarea
                      id="catatan"
                      rows={3}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder={t("booking.catatan_placeholder")}
                      className="peer w-full resize-none rounded-xl border-0 bg-transparent py-[13px] pl-10 pr-4 font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:outline-none focus:ring-0 lg:py-3.5 lg:pl-11 lg:text-base"
                    />
                    <FileText
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-3.5 shrink-0 text-text-secondary transition-colors duration-200 peer-focus:text-accent lg:left-4 lg:top-4"
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
                        {t("booking.ringkasan")}
                      </h2>
                      <p className="font-display text-xs text-paper/70">
                        {hasDates ? t("booking.review") : t("booking.belum_ada_tanggal")}
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
                          {t("booking.pengambilan_di")}{" "}
                          <span className="font-semibold text-text-primary">{equipment.location}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="shrink-0 text-text-secondary" />
                        <span className="font-display text-sm text-text-secondary">
                          {t("booking.penyedia")}{" "}
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
                        {t("booking.pilih_tanggal")}
                      </p>
                      <p className="mt-1 font-display text-xs text-text-secondary">
                        {t("booking.ringkasan_desc")}
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
                                {t("booking.durasi_sewa")}
                              </span>
                              <span className="font-display text-sm font-semibold text-text-primary">
                                {days} {t("booking.hari")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-display text-sm text-text-secondary">
                                {formatPrice(equipment.pricePerDay)} × {days} {t("booking.hari")}
                              </span>
                              <AnimatedPrice value={total} className="font-display text-sm font-semibold text-text-primary" />
                            </div>
                          </div>

                          {/* Divider with label */}
                          <div className="relative px-7">
                            <hr className="border-surface-border" />
                          </div>

                          {/* Total */}
                          <div className="flex items-center justify-between px-7 py-5">
                            <span className="font-display text-base font-bold text-text-primary">
                              {t("booking.total")}
                            </span>
                            <span className="font-display text-2xl font-bold text-accent">
                              <AnimatedPrice value={total} />
                            </span>
                          </div>

                          {/* Date range summary */}
                          <div className="border-t border-surface-border bg-bg-elevated/50 px-7 py-3">
                            <div className="flex items-center justify-between font-display text-xs text-text-secondary">
                              <span>{t("booking.ambil")} {formatDate(tanggalAmbil)}</span>
                              <span>{t("booking.kembali")} {formatDate(tanggalKembali)}</span>
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
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
                  >
                    {t("booking.lanjut_konfirmasi")}
                    <ChevronRight size={18} />
                  </motion.button>
                  {hasDates && (
                    <p className="mt-2 text-center font-display text-[11px] text-text-secondary">
                      {t("booking.data_dapat_diubah")}
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
                <p className="font-display text-xs text-text-secondary">{t("booking.total_sewa")}</p>
                <p className="font-display text-xl font-bold text-accent">
                  {hasDates ? <AnimatedPrice value={total} /> : "\u2014"}
                </p>
                {hasDates && (
                  <p className="font-display text-[11px] text-text-secondary">
                    {days} {t("booking.hari")} x {formatPrice(equipment.pricePerDay)}
                  </p>
                )}
              </div>
              <motion.button
                onClick={goToKonfirmasi}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent px-6 py-3 font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
              >
                {t("booking.lanjut")}
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        <RenterSwitchModal
          open={showRenterModal}
          onClose={() => setShowRenterModal(false)}
          onSuccess={() => window.location.reload()}
        />

      </motion.div>
    </PageShell>
  );
}
