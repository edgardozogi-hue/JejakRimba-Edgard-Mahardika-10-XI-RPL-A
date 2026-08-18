"use client";

import { Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Calendar,
  User,
  Phone,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createMultiBooking } from "../../actions/booking";
import { createSnapToken } from "../../actions/midtrans";
import { loadMidtransScript } from "../../lib/midtrans";
import PageShell from "../../components/PageShell";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { useCart } from "../../lib/cart";

type SnapHandlers = {
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
  onClose: () => void;
};

interface WindowWithSnap {
  snap: { pay: (token: string, handlers: SnapHandlers) => void };
}

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

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, totalPerDay, clear } = useCart();

  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";

  const days = useMemo(() => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
  }, [start, end]);

  const total = days * totalPerDay;

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [catatan, setCatatan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!nama.trim()) errs.nama = "Nama lengkap wajib diisi.";
    if (!noHp.trim()) errs.noHp = "Nomor WhatsApp wajib diisi.";
    if (!start || !end || days === 0) errs.tanggal = "Periode sewa belum valid.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleBayar() {
    if (!validate()) return;
    if (items.length === 0) {
      setSubmitError("Keranjang sudah kosong.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const result = await createMultiBooking({
      start_date: start,
      end_date: end,
      notes: catatan || undefined,
      items: items.map((i) => ({ equipment_id: i.equipmentId, quantity: i.quantity })),
    });

    if (result.error) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    const bookingId = result.bookingId!;
    clear();

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey || clientKey.includes("xxxx")) {
      router.push(`/booking/${bookingId}/status`);
      return;
    }

    const snapResult = await createSnapToken(bookingId);
    if (snapResult.error) {
      setSubmitError(snapResult.error);
      setSubmitting(false);
      return;
    }

    try {
      await loadMidtransScript();
      (window as unknown as WindowWithSnap).snap.pay(snapResult.token!, {
        onSuccess: () => router.push(`/booking/${bookingId}/status`),
        onPending: () => router.push(`/booking/${bookingId}/status`),
        onError: () => {
          setSubmitError("Pembayaran gagal. Silakan coba lagi.");
          setSubmitting(false);
        },
        onClose: () => setSubmitting(false),
      });
    } catch {
      if (snapResult.redirect_url) {
        window.location.assign(snapResult.redirect_url);
      } else {
        router.push(`/booking/${bookingId}/status`);
      }
    }
  }

  return (
    <PageShell showNav={false}>
      <motion.div
        className="mx-auto max-w-5xl px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-6">
          <Link
            href="/booking/keranjang"
            className="mb-3 inline-flex items-center gap-1.5 font-display text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            Kembali ke Keranjang
          </Link>
          <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
            KONFIRMASI SEWA
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            Lengkapi Data & Bayar
          </h1>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Form */}
          <motion.div variants={fadeUp} className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <User size={16} className="text-accent" />
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Data Penyewa
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="cek-nama"
                    className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary"
                  >
                    Nama Lengkap <span className="text-red">*</span>
                  </label>
                  <input
                    id="cek-nama"
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
                    placeholder="Nama lengkap kamu"
                    className={`w-full rounded-xl border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/30 ${
                      errors.nama ? "border-red" : "border-surface-border"
                    }`}
                  />
                  {errors.nama && (
                    <p className="mt-1 text-xs font-display text-red">{errors.nama}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cek-hp"
                    className="flex items-center gap-1.5 text-sm font-medium text-text-primary"
                  >
                    <Phone size={14} className="text-text-secondary" />
                    No. WhatsApp <span className="text-red">*</span>
                  </label>
                  <input
                    id="cek-hp"
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

                {errors.tanggal && (
                  <p className="text-xs font-display text-red">{errors.tanggal}</p>
                )}

                <div>
                  <label
                    htmlFor="cek-catatan"
                    className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary"
                  >
                    Catatan{" "}
                    <span className="ml-1 text-xs font-normal text-text-secondary">
                      opsional
                    </span>
                  </label>
                  <textarea
                    id="cek-catatan"
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: antar ke basecamp jam 06.00"
                    className="w-full resize-none rounded-xl border border-surface-border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>

              {/* Mobile submit */}
              <div className="mt-5 lg:hidden">
                <div className="mb-3 rounded-xl bg-bg-elevated p-4">
                  <div className="flex items-center justify-between font-display text-sm">
                    <span className="text-text-secondary">Total</span>
                    <span className="font-display text-lg font-bold text-accent">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">
                    {days} hari &middot; {items.length} jenis alat
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
                      Memproses
                    </span>
                  ) : (
                    "Konfirmasi & Bayar"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 border-b border-surface-border pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <ShoppingCart size={16} className="text-accent" />
                </div>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Ringkasan ({items.length} jenis)
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.equipmentId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-text-primary">
                        {item.name}
                      </p>
                      <p className="font-archivo text-xs text-text-secondary">
                        {formatPrice(item.pricePerDay)} x {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 font-archivo text-sm font-semibold text-text-primary">
                      {formatPrice(item.pricePerDay * item.quantity * days)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-surface-border" />

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-display text-sm text-text-secondary">
                  <Clock size={14} />
                  Durasi
                </span>
                <span className="font-display text-sm font-semibold text-text-primary">
                  {days} hari
                </span>
              </div>

              <hr className="my-4 border-surface-border" />

              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-text-primary">Total</span>
                <span className="font-archivo text-xl font-bold text-accent">
                  {formatPrice(total)}
                </span>
              </div>

              {submitError && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-red/10 px-4 py-3 text-sm text-red">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <motion.button
                onClick={handleBayar}
                disabled={submitting}
                className="mt-5 w-full cursor-pointer rounded-xl bg-accent px-6 py-[15px] font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    Memproses
                  </span>
                ) : (
                  "Konfirmasi & Bayar"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  );
}