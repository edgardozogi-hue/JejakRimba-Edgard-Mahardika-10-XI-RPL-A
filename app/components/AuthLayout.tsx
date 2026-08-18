"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Mountain, ArrowLeft } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export default function AuthLayout({
  children,
  activeTab,
}: {
  children: ReactNode;
  activeTab: "masuk" | "daftar";
}) {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen">
      {/* Form panel */}
      <div className="flex w-full flex-col justify-center bg-bg px-6 py-12 md:w-1/2 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Header with logo + back */}
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
              href="/"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
            >
              <ArrowLeft size={16} />
              {t("auth.kembali")}
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="mb-8 flex gap-1 rounded-full bg-bg-elevated p-1">
            <Link
              href="/masuk"
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition ${
                activeTab === "masuk"
                  ? "bg-accent text-paper"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t("auth.masuk")}
            </Link>
            <Link
              href="/daftar"
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition ${
                activeTab === "daftar"
                  ? "bg-accent text-paper"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t("auth.daftar")}
            </Link>
          </div>

          {children}
        </div>
      </div>

      {/* Visual panel */}
      <div className="relative hidden w-1/2 overflow-hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
          alt={t("home.hero_title")}
          className="h-full w-full object-cover"
        />
      </div>
    </main>
  );
}
