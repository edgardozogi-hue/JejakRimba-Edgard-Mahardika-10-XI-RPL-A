import Link from "next/link";
import { ReactNode } from "react";
import { Mountain, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
  activeTab,
}: {
  children: ReactNode;
  activeTab: "masuk" | "daftar";
}) {
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
              Kembali
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
              Masuk
            </Link>
            <Link
              href="/daftar"
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition ${
                activeTab === "daftar"
                  ? "bg-accent text-paper"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Daftar
            </Link>
          </div>

          {children}
        </div>
      </div>

      {/* Visual panel */}
      <div className="contour-bg relative hidden w-1/2 items-center justify-center overflow-hidden md:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-bark via-transparent to-transparent opacity-60" />
        <div className="relative z-10 max-w-md px-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ember-light">
            Terpercaya Sejak 2024
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-paper">
            Setiap jejak dimulai dari perlengkapan yang tepat.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-paper/70">
            Sewa alat mendaki dan berkemah berkualitas dari mitra terpercaya
            di seluruh Malang Raya.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-paper/15 pt-6">
            <div>
              <p className="font-display text-xl font-bold text-paper">500+</p>
              <p className="mt-0.5 text-[11px] text-paper/50">Alat</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-paper">40+</p>
              <p className="mt-0.5 text-[11px] text-paper/50">Mitra</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-paper">12</p>
              <p className="mt-0.5 text-[11px] text-paper/50">Lokasi</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
