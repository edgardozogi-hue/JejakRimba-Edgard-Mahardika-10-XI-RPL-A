"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Tent,
  Store,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import MapLocationPicker, { type LocationPicked } from "../components/MapLocationPicker";
import { supabase } from "../lib/supabase";
import { completeRegistration } from "../actions/auth";
import { staggerContainer, fadeUp } from "../lib/animations";
import { useLanguage } from "../lib/i18n";

type Role = "penyewa" | "vendor";

export default function DaftarPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("penyewa");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<LocationPicked>({
    lat: -7.9666,
    lng: 112.6326,
    address: "",
    city: "Malang",
    error: null,
  });

  function validateStep1(): string | null {
    if (!fullName.trim()) return t("auth.error_nama");
    if (!email.trim()) return t("auth.error_email");
    if (!phone.trim()) return t("auth.error_telepon");
    if (password.length < 8) return t("auth.error_pass_panjang");
    if (password !== confirmPassword) return t("auth.error_pass_cocok");
    return null;
  }

  async function registerAccount(extraVendorData?: {
    business_name: string;
    business_description: string;
    whatsapp_number: string;
    address: string;
    lat: number;
    lng: number;
    city: string;
  }) {
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? t("auth.error_buat"));
      return;
    }

    // Simpan profile + vendor via service role (bypass RLS karena user baru
    // belum punya session). Kalau email confirmation wajib, akun sudah dibuat
    // tapi user harus konfirmasi dulu sebelum bisa masuk.
    const res = await completeRegistration({
      userId: data.user.id,
      fullName,
      phone,
      role,
      vendor_data:
        role === "vendor" && extraVendorData
          ? {
              business_name: extraVendorData.business_name,
              business_description: extraVendorData.business_description,
              whatsapp_number: extraVendorData.whatsapp_number,
              address: extraVendorData.address,
              city: extraVendorData.city,
              lat: extraVendorData.lat,
              lng: extraVendorData.lng,
            }
          : undefined,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    router.push("/");
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (role === "penyewa") {
      registerAccount();
    } else {
      setStep(2);
    }
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !address.trim() || !whatsapp.trim()) {
      setError(t("auth.error_bisnis"));
      return;
    }
    setError(null);
    registerAccount({
      business_name: businessName,
      business_description: businessDesc,
      whatsapp_number: whatsapp,
      address,
      lat: location.lat,
      lng: location.lng,
      city: location.city,
    });
  }

  return (
    <AuthLayout activeTab="daftar">
      {step === 1 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-accent" />
            <div className="h-1.5 flex-1 rounded-full bg-bg-elevated" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mb-1 font-archivo text-xs text-text-secondary"
          >
            {t("auth.langkah")} 1 {t("auth.dari")} {role === "vendor" ? "2" : "1"}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-2xl font-bold text-text-primary"
          >
            {t("auth.buat_akun")}
          </motion.h1>

          {/* Role toggle */}
          <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => setRole("penyewa")}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition ${
                  role === "penyewa"
                    ? "border-accent bg-accent/10"
                    : "border-surface-border bg-surface hover:border-accent/40"
                }`}
              >
                <Tent size={20} className={role === "penyewa" ? "text-accent" : "text-text-secondary"} />
                <span className={`text-sm font-semibold ${role === "penyewa" ? "text-accent" : "text-text-primary"}`}>
                  {t("profil.mode_penyewa")}
                </span>
              </motion.button>
            <motion.button
              type="button"
              onClick={() => setRole("vendor")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition ${
                role === "vendor"
                  ? "border-accent bg-accent/10"
                  : "border-surface-border bg-surface hover:border-accent/40"
              }`}
            >
              <Store size={20} className={role === "vendor" ? "text-accent" : "text-text-secondary"} />
              <span className={`text-sm font-semibold ${role === "vendor" ? "text-accent" : "text-text-primary"}`}>
                {t("profil.mode_vendor")}
              </span>
            </motion.button>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleStep1Submit} className="mt-6 space-y-4">
            <Field label={t("auth.nama_lengkap")} value={fullName} onChange={setFullName} placeholder={t("auth.nama_lengkap_placeholder")} />
            <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} placeholder={t("auth.email_placeholder")} />
            <Field label={t("auth.nomor_telepon")} value={phone} onChange={setPhone} placeholder={t("auth.telepon_placeholder")} />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t("auth.password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.password_min")}
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-text-secondary transition hover:bg-surface hover:text-text-primary"
                  aria-label={showPassword ? t("auth.sembunyikan") : t("auth.tampilkan")}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <Field label={t("auth.konfirmasi_password")} type={showPassword ? "text" : "password"} value={confirmPassword} onChange={setConfirmPassword} placeholder={t("auth.ulangi_password")} />

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-sm text-text-primary">{error}</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading
                ? t("auth.memproses")
                : role === "vendor"
                  ? t("auth.lanjutkan")
                  : t("auth.buat_akun_btn")}
            </motion.button>
          </motion.form>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.button
            variants={fadeUp}
            onClick={() => setStep(1)}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} /> {t("auth.kembali")}
          </motion.button>

          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-accent" />
            <div className="h-1.5 flex-1 rounded-full bg-accent" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mb-1 font-archivo text-xs text-text-secondary"
          >
            {t("auth.langkah")} 2 {t("auth.dari")} 2
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-2xl font-bold text-text-primary"
          >
            {t("auth.info_bisnis")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-1 text-sm text-text-secondary"
          >
            {t("auth.info_bisnis_desc")}
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleStep2Submit} className="mt-6 space-y-4">
            <Field label={t("auth.nama_bisnis")} value={businessName} onChange={setBusinessName} placeholder={t("auth.nama_bisnis_placeholder")} />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                {t("auth.deskripsi_bisnis")} <span className="text-text-secondary">{t("auth.opsional")}</span>
              </label>
              <textarea
                value={businessDesc}
                onChange={(e) => setBusinessDesc(e.target.value)}
                placeholder={t("auth.deskripsi_bisnis_placeholder")}
                rows={3}
                className="w-full resize-none rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t("auth.whatsapp")}</label>
              <div className="flex overflow-hidden rounded-xl border border-surface-border bg-surface transition focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <span className="flex items-center bg-bg-elevated px-3 text-sm text-text-secondary">+62</span>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="81234567890"
                  className="w-full px-3 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t("auth.alamat_bisnis")}</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("auth.alamat_placeholder")}
                rows={2}
                className="w-full resize-none rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">{t("auth.titik_lokasi")}</label>
              <MapLocationPicker
                onChange={setLocation}
                initial={location}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-sm text-text-primary">{error}</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? t("auth.memproses") : t("auth.selesai_daftar")}
            </motion.button>
          </motion.form>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="mt-8 text-center text-sm text-text-secondary"
      >
        {t("auth.sudah_punya_akun")}{" "}
        <Link href="/masuk" className="font-semibold text-accent hover:underline">
          {t("auth.masuk_di_sini")}
        </Link>
      </motion.p>
    </AuthLayout>
  );
}

/* â”€â”€ Reusable input field â”€â”€ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
