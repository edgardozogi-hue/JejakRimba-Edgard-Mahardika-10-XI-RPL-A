"use client";

import { useState } from "react";
import Link from "next/link";
import { Mountain, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/masuk`,
    });

    setLoading(false);
    if (error) {
      setError("Gagal mengirim email reset. Coba lagi nanti.");
      return;
    }
    setSuccess(true);
  }

  return (
    <main className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center bg-bg px-6 py-12 md:w-1/2 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-paper">
                <Mountain size={18} strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold text-text-primary">
                Jejak Rimba
              </span>
            </Link>
            <Link
              href="/masuk"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-text-primary">
            Lupa password?
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Masukkan email kamu dan kami akan kirim link buat reset password.
          </p>

          {success ? (
            <div className="mt-8 flex items-start gap-2 rounded-xl bg-bg-elevated px-4 py-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-sm text-text-primary">
                Link reset password udah dikirim ke <strong>{email}</strong>.
                Cek inbox kamu (dan folder spam kalau gak nemu).
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-bg-elevated px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                  <p className="text-sm text-text-primary">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? "Memproses..." : "Kirim Link Reset"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-text-secondary">
            Ingat password?{" "}
            <Link href="/masuk" className="font-semibold text-accent hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Panel kanan — visual (desktop only) */}
      <div className="contour-bg relative hidden w-1/2 items-center justify-center overflow-hidden md:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-bark via-transparent to-transparent opacity-60" />
        <div className="relative z-10 max-w-md px-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ember-light">
            Jangan Khawatir
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-paper">
            Kami bantu balikin akses kamu.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-paper/70">
            Link reset password akan langsung aktif dalam beberapa menit.
            Ikuti petunjuk di email untuk buat password baru.
          </p>
        </div>
      </div>
    </main>
  );
}
