"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserCircle,
  LogIn,
  UserPlus,
  Mountain,
  Package,
  ClipboardList,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabase";
import { staggerContainer, fadeUp, blurReveal, spring, scaleIn } from "../lib/animations";

const links = [
  {
    href: "/booking",
    icon: ClipboardList,
    label: "Booking Saya",
    desc: "Lihat riwayat dan status sewa",
  },
  {
    href: "/profil/dashboard-vendor",
    icon: Package,
    label: "Dashboard Vendor",
    desc: "Kelola alat dan booking masuk",
  },
  {
    href: "/profil/pengaturan",
    icon: Settings,
    label: "Pengaturan",
    desc: "Ubah profil dan preferensi",
  },
];

export default function ProfilPage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    createdAt: Date | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setUser({
          name:
            meta?.full_name ?? meta?.name ?? data.user.email?.split("@")[0] ?? "User",
          email: data.user.email ?? "",
          role: meta?.role ?? "Penyewa",
          createdAt: data.user.created_at ? new Date(data.user.created_at) : null,
        });
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          name:
            meta?.full_name ?? meta?.name ?? session.user.email?.split("@")[0] ?? "User",
          email: session.user.email ?? "",
          role: meta?.role ?? "Penyewa",
          createdAt: session.user.created_at ? new Date(session.user.created_at) : null,
        });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center md:max-w-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-border" />
          </div>
          <div className="mx-auto h-6 w-48 animate-pulse rounded bg-surface-border" />
          <div className="mx-auto mt-3 h-4 w-32 animate-pulse rounded bg-surface-border" />
        </div>
      </PageShell>
    );
  }

  // ── Logged in ──
  if (user) {
    const initial = user.name.charAt(0).toUpperCase();

    // ── Mobile Layout (< md) ──
    const mobileView = (
      <div className="md:hidden">
        <motion.div
          className="mx-auto max-w-md px-6 py-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Profile header */}
          <motion.div variants={staggerContainer} className="flex items-center gap-4">
            <motion.span
              variants={scaleIn}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-paper"
            >
              {initial}
            </motion.span>
            <motion.div variants={fadeUp}>
              <h1 className="font-display text-xl font-bold text-text-primary">
                {user.name}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">{user.email}</p>
            </motion.div>
          </motion.div>

          {/* Menu links */}
          <motion.div variants={staggerContainer} className="mt-8 space-y-2">
            {links.map((link) => (
              <MenuLink key={link.href} {...link} showChevron />
            ))}
          </motion.div>

          {/* Logout */}
          <motion.button
            variants={fadeUp}
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-secondary transition hover:border-red-400 hover:text-red-500"
          >
            <LogOut size={18} />
            Keluar
          </motion.button>
        </motion.div>
      </div>
    );

    // ── Desktop Layout (≥ md) ──
    const desktopView = (
      <div className="hidden md:block">
        <motion.div
          className="mx-auto max-w-4xl px-8 py-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="overflow-hidden rounded-2xl border border-surface-border md:grid md:grid-cols-[30%_1fr] md:gap-0">
            {/* Left column — profile sidebar */}
            <div className="flex flex-col items-center border-surface-border bg-surface px-6 py-10 text-center md:border-r">
              <motion.span
                variants={scaleIn}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-4xl font-bold text-paper"
              >
                {initial}
              </motion.span>
              <motion.div variants={fadeUp} className="mt-5">
                <h1 className="font-display text-xl font-bold text-text-primary">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
              </motion.div>

              {/* Role badge */}
              <motion.span
                variants={scaleIn}
                className="mt-4 inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent"
              >
                {user.role}
              </motion.span>

              {/* Stats */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3">
                <div className="text-center">
                  <p className="font-mono text-xl font-bold text-text-primary">0</p>
                  <p className="text-xs text-text-secondary">Total Booking</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-xs text-text-secondary">
                    Bergabung sejak {user.createdAt?.getFullYear() ?? 2026}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right column — menu + logout */}
            <div className="flex flex-col px-6 py-8">
              <motion.div variants={staggerContainer} className="space-y-2">
                {links.map((link) => (
                  <MenuLink key={link.href} {...link} showChevron={false} />
                ))}
              </motion.div>

              <motion.button
                variants={fadeUp}
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-secondary transition hover:border-red-400 hover:text-red-500"
              >
                <LogOut size={18} />
                Keluar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );

    return (
      <PageShell>
        {mobileView}
        {desktopView}
      </PageShell>
    );
  }

  // ── Not logged in ──
  return (
    <PageShell>
      <motion.div
        className="mx-auto max-w-md px-6 py-16 text-center md:max-w-lg"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Icon */}
        <motion.div
          variants={scaleIn}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated"
        >
          <UserCircle size={40} className="text-text-secondary" />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-display text-2xl font-bold text-text-primary"
        >
          Kamu belum masuk
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-2 text-sm text-text-secondary"
        >
          Masuk atau buat akun buat akses profil, booking, dan dashboard sesuai
          peran kamu.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
          >
            <Link
              href="/masuk"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              <LogIn size={18} />
              Masuk
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
          >
            <Link
              href="/daftar"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent"
            >
              <UserPlus size={18} />
              Daftar
            </Link>
          </motion.div>
        </motion.div>

        {/* Benefits */}
        <motion.div variants={staggerContainer} className="mt-12 space-y-3 text-left">
          <motion.div
            variants={fadeUp}
            className="flex items-start gap-3 rounded-2xl border border-surface-border bg-surface p-4"
          >
            <Mountain size={18} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Penyewa</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Kelola booking, cek status sewa, dan kasih ulasan.
              </p>
            </div>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex items-start gap-3 rounded-2xl border border-surface-border bg-surface p-4"
          >
            <UserPlus size={18} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Vendor</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Kelola alat, lihat booking masuk, dan atur ketersediaan.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}

/** Reusable menu link card */
function MenuLink({
  href,
  icon: Icon,
  label,
  desc,
  showChevron = true,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  showChevron?: boolean;
}) {
  return (
    <motion.div variants={blurReveal}>
      <motion.div
        whileHover={showChevron ? { scale: 1.02, x: 6 } : { x: 8 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
      >
        <Link
          href={href}
          className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface p-4 transition hover:border-accent"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Icon size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{label}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{desc}</p>
          </div>
          {showChevron && (
            <ChevronRight size={18} className="shrink-0 text-text-secondary" />
          )}
        </Link>
      </motion.div>
    </motion.div>
  );
}
