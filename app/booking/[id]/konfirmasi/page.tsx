"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Tent,
  Calendar,
  User,
  Phone,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getEquipmentById } from "../../../actions/equipment";
import { createBooking } from "../../../actions/booking";
import { createSnapToken } from "../../../actions/midtrans";
import { loadMidtransScript } from "../../../lib/midtrans";
import type { EquipmentFrontend } from "../../../lib/database.types";
import PageShell from "../../../components/PageShell";
import { staggerContainer, fadeUp } from "../../../lib/animations";
import { useLanguage } from "../../../lib/i18n";

type SnapHandlers = {
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
  onClose: () => void;
};

interface WindowWithSnap {
  snap: { pay: (token: string, handlers: SnapHandlers) => void };
}

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
  const router = useRouter();
  const { t } = useLanguage();

  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";
  const daysStr = searchParams.get("days") ?? "0";
  const days = parseInt(daysStr, 10) || 0;

  const [equipment, setEquipment] = useState<EquipmentFrontend | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [catatan, setCatatan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getEquipmentById(params.id as string).then((data) => {
      setEquipment(data);
      setLoading(false);
    });
  }, [params.id]);

  const total = useMemo(
    () => (equipment ? days * equipment.pricePerDay : 0),
    [days, equipment],
  );

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!nama.trim()) errs.nama = t("booking.err_nama");
    if (!noHp.trim()) errs.noHp = t("booking.err_hp");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleBayar() {
    if (!validate() || !equipment) return;
    setSubmitting(true);
    setSubmitError(null);

    // 1. Create booking
    const result = await createBooking({
      equipment_id: equipment.id,
      quantity: 1,
      start_date: start,
      end_date: end,
      notes: catatan || undefined,
    });

    if (result.error) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    const bookingId = result.bookingId!;

    // 2. Cek apakah Midtrans dikonfigurasi
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey || clientKey.includes("xxxx")) {
      // Fallback: langsung redirect ke status (tanpa bayar)
      router.push(`/booking/${bookingId}/status`);
      return;
    }

    // 3. Dapatkan Snap token
    const snapResult = await createSnapToken(bookingId);

    if (snapResult.error) {
      setSubmitError(snapResult.error);
      setSubmitting(false);
      return;
    }

    // 4. Load Snap script & buka popup
    try {
      await loadMidtransScript();
      (window as unknown as WindowWithSnap).snap.pay(snapResult.token!, {
        onSuccess: () => {
          router.push(`/booking/${bookingId}/status`);
        },
        onPending: () => {
          router.push(`/booking/${bookingId}/status`);
        },
        onError: () => {
          setSubmitError(t("booking.bayar_gagal"));
          setSubmitting(false);
        },
        onClose: () => {
          setSubmitting(false);
        },
      });
    } catch {
      // Fallback: redirect_url
      if (snapResult.redirect_url) {
        window.location.assign(snapResult.redirect_url);
      } else {
        router.push(`/booking/${bookingId}/status`);
      }
    }
  }

  // ── Loading state ──

  if (loading) {
    return (
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
    );
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
            {t("common.back")}
          </Link>
          <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
            {t("booking.konfirmasi_kicker")}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            {t("booking.lengkapi_data")}
          </h1>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* ── Left column: Form ── */}
          <motion.div variants={fadeUp} className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <User size={16} className="text-accent" />
                <h2 className="font-display text-base font-semibold text-text-primary">
                  {t("booking.data_penyewa")}
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="konf-nama"
                    className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary"
                  >
                    {t("auth.nama_lengkap")} <span className="text-red">*</span>
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
                    placeholder={t("auth.nama_lengkap_placeholder")}
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
                    {t("booking.no_hp")} <span className="text-red">*</span>
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
                    placeholder={t("booking.hp_placeholder")}
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
                      {t("booking.tanggal_ambil")}
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
                      {t("booking.tanggal_kembali")}
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
                    {t("booking.catatan")}
                    <span className="ml-1 text-xs font-normal text-text-secondary">
                      {t("auth.opsional")}
                    </span>
                  </label>
                  <textarea
                    id="konf-catatan"
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder={t("booking.catatan_placeholder")}
                    className="w-full resize-none rounded-xl border border-surface-border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="mt-5 lg:hidden">
                <div className="mb-3 rounded-xl bg-bg-elevated p-4">
                  <div className="flex items-center justify-between font-display text-sm">
                    <span className="text-text-secondary">{t("booking.total")}</span>
                    <span className="font-display text-lg font-bold text-accent">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
                    <span>{days} {t("booking.hari")}</span>
                    <span>{formatPrice(equipment.pricePerDay)}{t("booking.per_hari")}</span>
                  </div>
                </div>
                {submitError && (
                  <div className="mb-3 flex items-start gap-2 rounded-xl bg-red/10 px-4 py-3 text-sm text-red">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
                <motion.button
                  onClick={handleBayar}
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-xl bg-accent px-6 py-[15px] font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      {t("booking.memproses")}
                    </span>
                  ) : (
                    t("booking.konfirmasi_bayar")
                  )}
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
                  {t("booking.ringkasan")}
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
                    {t("booking.durasi_sewa")}
                  </span>
                  <span className="font-display text-sm font-semibold text-text-primary">
                    {days} {t("booking.hari")}
                  </span>
                </div>

                {/* Harga per hari */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm text-text-secondary">
                    {t("booking.harga_per_hari")}
                  </span>
                  <span className="font-display text-sm font-semibold text-text-primary">
                    {formatPrice(equipment.pricePerDay)}
                  </span>
                </div>

                <hr className="border-surface-border" />

                {/* Tanggal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-display text-xs">
                    <span className="text-text-secondary">{t("booking.ambil_short")}</span>
                    <span className="font-semibold text-text-primary">
                      {start ? formatDate(start) : "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-display text-xs">
                    <span className="text-text-secondary">{t("booking.kembali_short")}</span>
                    <span className="font-semibold text-text-primary">
                      {end ? formatDate(end) : "\u2014"}
                    </span>
                  </div>
                </div>

                <hr className="border-surface-border" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-text-primary">
                    {t("booking.total")}
                  </span>
                  <span className="font-display text-xl font-bold text-accent">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-red/10 px-4 py-3 text-sm text-red">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* CTA */}
              <motion.button
                onClick={handleBayar}
                disabled={submitting}
                className="mt-5 w-full cursor-pointer rounded-xl bg-accent px-6 py-[15px] font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    {t("booking.memproses")}
                  </span>
                ) : (
                  t("booking.konfirmasi_bayar")
                )}
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
