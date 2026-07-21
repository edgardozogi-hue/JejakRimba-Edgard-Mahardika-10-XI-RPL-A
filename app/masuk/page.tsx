"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../lib/supabase";
import { staggerContainer, fadeUp, spring } from "../lib/animations";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Email atau password salah. Coba periksa lagi.");
      return;
    }
    router.push("/");
  }

  async function handleGoogleLogin() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setError("Gagal masuk dengan Google. Coba lagi nanti.");
    }
  }

  return (
    <AuthLayout activeTab="masuk">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-text-primary">
          Selamat datang kembali
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1 text-sm text-text-secondary">
          Masuk buat lanjut sewa alat petualanganmu.
        </motion.p>

        <motion.form variants={fadeUp} onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-text-primary">Password</label>
              <Link href="/lupa-password" className="text-xs font-medium text-accent hover:underline">
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="......"
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 pr-11 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
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
            {loading ? "Memproses..." : "Masuk"}
          </motion.button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <span className="relative bg-bg px-3 text-xs font-medium text-text-secondary">
              Atau masuk dengan
            </span>
          </div>

          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-accent"
          >
            <GoogleIcon />
            Masuk dengan Google
          </motion.button>
        </motion.form>

        <motion.p variants={fadeUp} className="mt-8 text-center text-sm text-text-secondary">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-accent hover:underline">
            Daftar di sini
          </Link>
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex justify-center gap-4 text-xs text-text-secondary/70">
          <Link href="/privasi" className="hover:text-text-primary">Kebijakan Privasi</Link>
          <span>·</span>
          <Link href="/syarat" className="hover:text-text-primary">Syarat &amp; Ketentuan</Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
