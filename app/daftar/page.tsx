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
  MapPin,
  Tent,
  Store,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../lib/supabase";
import { staggerContainer, fadeUp, spring } from "../lib/animations";

type Role = "penyewa" | "vendor";

export default function DaftarPage() {
  const router = useRouter();
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

  function validateStep1(): string | null {
    if (!fullName.trim()) return "Nama lengkap wajib diisi.";
    if (!email.trim()) return "Email wajib diisi.";
    if (!phone.trim()) return "Nomor telepon wajib diisi.";
    if (password.length < 8) return "Password minimal 8 karakter.";
    if (password !== confirmPassword) return "Konfirmasi password tidak cocok.";
    return null;
  }

  async function registerAccount(extraVendorData?: {
    business_name: string;
    business_description: string;
    whatsapp_number: string;
    address: string;
  }) {
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? "Gagal membuat akun. Coba lagi.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      phone_number: phone,
      role,
    });

    if (profileError) {
      setLoading(false);
      setError("Akun dibuat, tapi gagal menyimpan profil: " + profileError.message);
      return;
    }

    if (role === "vendor" && extraVendorData) {
      const { error: vendorError } = await supabase.from("vendors").insert({
        profile_id: data.user.id,
        business_name: extraVendorData.business_name,
        business_description: extraVendorData.business_description,
        whatsapp_number: extraVendorData.whatsapp_number,
        address: extraVendorData.address,
        latitude: -7.9666,
        longitude: 112.6326,
      });

      if (vendorError) {
        setLoading(false);
        setError("Profil dibuat, tapi gagal menyimpan data usaha: " + vendorError.message);
        return;
      }
    }

    setLoading(false);
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
      setError("Nama usaha, alamat, dan nomor WhatsApp wajib diisi.");
      return;
    }
    setError(null);
    registerAccount({
      business_name: businessName,
      business_description: businessDesc,
      whatsapp_number: whatsapp,
      address,
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
            className="mb-1 font-mono text-xs text-text-secondary"
          >
            Langkah 1 dari {role === "vendor" ? "2" : "1"}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-2xl font-bold text-text-primary"
          >
            Buat akun baru
          </motion.h1>

          {/* Role toggle */}
          <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={() => setRole("penyewa")}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition ${
                role === "penyewa"
                  ? "border-accent bg-accent/10"
                  : "border-surface-border bg-surface hover:border-accent/40"
              }`}
            >
              <Tent size={20} className={role === "penyewa" ? "text-accent" : "text-text-secondary"} />
              <span className={`text-sm font-semibold ${role === "penyewa" ? "text-accent" : "text-text-primary"}`}>
                Penyewa
              </span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setRole("vendor")}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition ${
                role === "vendor"
                  ? "border-accent bg-accent/10"
                  : "border-surface-border bg-surface hover:border-accent/40"
              }`}
            >
              <Store size={20} className={role === "vendor" ? "text-accent" : "text-text-secondary"} />
              <span className={`text-sm font-semibold ${role === "vendor" ? "text-accent" : "text-text-primary"}`}>
                Vendor
              </span>
            </motion.button>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleStep1Submit} className="mt-6 space-y-4">
            <Field label="Nama Lengkap" value={fullName} onChange={setFullName} placeholder="Masukkan nama lengkap" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="contoh@email.com" />
            <Field label="Nomor Telepon" value={phone} onChange={setPhone} placeholder="0812xxxx" />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-text-primary"
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <Field label="Konfirmasi Password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={setConfirmPassword} placeholder="Ulangi password" />

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-sm text-text-primary">{error}</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading
                ? "Memproses..."
                : role === "vendor"
                  ? "Lanjutkan"
                  : "Buat Akun"}
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
            <ArrowLeft size={16} /> Kembali
          </motion.button>

          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-accent" />
            <div className="h-1.5 flex-1 rounded-full bg-accent" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mb-1 font-mono text-xs text-text-secondary"
          >
            Langkah 2 dari 2
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-2xl font-bold text-text-primary"
          >
            Informasi Bisnis
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-1 text-sm text-text-secondary"
          >
            Ceritain sedikit soal usaha persewaan alatmu.
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleStep2Submit} className="mt-6 space-y-4">
            <Field label="Nama Bisnis" value={businessName} onChange={setBusinessName} placeholder="Contoh: Rimba Gear Malang" />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                Deskripsi Bisnis <span className="text-text-secondary">(opsional)</span>
              </label>
              <textarea
                value={businessDesc}
                onChange={(e) => setBusinessDesc(e.target.value)}
                placeholder="Jelaskan layanan atau alat yang kamu sewakan..."
                rows={3}
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Nomor WhatsApp</label>
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
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Alamat Bisnis</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Raya Rimba No. 123, Malang"
                rows={2}
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Titik Lokasi</label>
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border bg-bg-elevated py-8 text-text-secondary transition hover:border-accent hover:text-accent"
              >
                <MapPin size={22} />
                <span className="text-xs">Ketuk untuk atur lokasi di peta</span>
              </button>
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Selesaikan Pendaftaran"}
            </motion.button>
          </motion.form>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-center text-sm text-text-secondary"
      >
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-accent hover:underline">
          Masuk di sini
        </Link>
      </motion.p>
    </AuthLayout>
  );
}

/* ── Reusable input field ── */
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
