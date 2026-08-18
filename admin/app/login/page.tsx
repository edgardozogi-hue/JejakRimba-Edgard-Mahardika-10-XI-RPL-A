"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { login } from "@/actions/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "/";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            <ShieldCheck size={28} className="text-paper" />
          </div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-text-primary">
            Komunitas Robotika
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">
            Admin Panel
          </p>
          <p className="mt-4 text-sm text-text-secondary">
            {t("admin.login_desc")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
            >
              {error}
            </motion.div>
          )}

          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email_placeholder")}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password_placeholder")}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-surface-border bg-surface px-11 py-3 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface hover:text-text-primary"
                aria-label={showPassword ? "hidden" : "show"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Masuk..." : t("auth.masuk")}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-text-secondary">
            {t("admin.admin_only")}
          </p>
          <Link
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ExternalLink size={13} /> {t("admin.back_to_site")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}