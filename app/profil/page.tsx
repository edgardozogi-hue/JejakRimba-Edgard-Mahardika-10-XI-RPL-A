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
  Store,
  ClipboardList,
  Settings,
  ChevronRight,
  Repeat,
  LogOut,
  Sparkles,
} from "lucide-react";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabase";
import { getProfileOverview, type ProfileOverview } from "../actions/auth";
import { staggerContainer, fadeUp, blurReveal, scaleIn } from "../lib/animations";

type ActiveMode = "renter" | "vendor";

export default function ProfilPage() {
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ActiveMode>("renter");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (data.user) {
        const res = await getProfileOverview();
        if (active) {
          setOverview(res);
          // Default mode: vendor kalau dia punya toko, selain itu renter
          if (res.vendor) setMode("vendor");
        }
      } else {
        setOverview({ user: null, profileRole: null, vendor: null, error: null });
      }
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        getProfileOverview().then((res) => {
          if (active) {
            setOverview(res);
            if (res.vendor) setMode("vendor");
          }
        });
      } else {
        setOverview({ user: null, profileRole: null, vendor: null, error: null });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
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

  const user = overview?.user;

  // ── Not logged in ──
  if (!user) {
    return (
      <PageShell>
        <motion.div
          className="mx-auto max-w-md px-6 py-16 text-center md:max-w-lg"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={scaleIn}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated"
          >
            <UserCircle size={40} className="text-text-secondary" />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-text-primary">
            Kamu belum masuk
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-2 text-sm text-text-secondary">
            Masuk atau buat akun buat akses profil, booking, dan dashboard sesuai peran kamu.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/masuk"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
            >
              <LogIn size={18} /> Masuk
            </Link>
            <Link
              href="/daftar"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent"
            >
              <UserPlus size={18} /> Daftar
            </Link>
          </motion.div>
        </motion.div>
      </PageShell>
    );
  }

  const name = user.full_name || user.email.split("@")[0] || "User";
  const initial = name.charAt(0).toUpperCase();
  const hasVendor = !!overview?.vendor;
  const effectiveMode: ActiveMode = hasVendor && mode === "vendor" ? "vendor" : "renter";
  const profileRole = overview?.profileRole;

  // Menu sesuai role aktif
  const menuLinks =
    effectiveMode === "vendor" && hasVendor
      ? [
          {
            href: "/profil/dashboard-vendor",
            icon: Package,
            label: "Dashboard Vendor",
            desc: "Kelola alat dan booking masuk",
            highlight: true,
          },
          { href: "/booking", icon: ClipboardList, label: "Booking Saya", desc: "Lihat riwayat dan status sewa" },
          { href: "/profil/pengaturan", icon: Settings, label: "Pengaturan", desc: "Ubah profil dan preferensi" },
        ]
      : [
          { href: "/booking", icon: ClipboardList, label: "Booking Saya", desc: "Lihat riwayat dan status sewa" },
          ...(hasVendor
            ? [{ href: "/profil/dashboard-vendor", icon: Store, label: "Buka Toko Saya", desc: "Kelola sebagai vendor", highlight: true }]
            : []),
          { href: "/profil/pengaturan", icon: Settings, label: "Pengaturan", desc: "Ubah profil dan preferensi" },
        ];

  const profileHeader = (
    <motion.div variants={fadeUp} className="mt-8 md:mt-0">
      <div className="flex items-center gap-4">
        <motion.span
          variants={scaleIn}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-paper md:h-24 md:w-24 md:text-4xl"
        >
          {initial}
        </motion.span>
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-xl font-bold text-text-primary md:text-2xl">{name}</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                effectiveMode === "vendor"
                  ? "bg-accent/15 text-accent"
                  : "bg-bg-elevated text-text-secondary"
              }`}
            >
              {effectiveMode === "vendor" ? <Store size={12} className="mr-1" /> : <Mountain size={12} className="mr-1" />}
              {effectiveMode === "vendor" ? "Vendor" : "Penyewa"}
            </span>
            {profileRole ? (
              <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary">
                terdaftar: {profileRole === "vendor" ? "Vendor" : "Penyewa"}
              </span>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Toggle role aktif (muncul hanya kalau punya toko vendor)
  const roleToggle = hasVendor ? (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex items-center justify-between rounded-2xl border border-surface-border bg-surface p-3"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Repeat size={16} className="text-accent" />
        Mode aktif
      </div>
      <div className="flex rounded-xl bg-bg-elevated p-1">
        <button
          onClick={() => setMode("renter")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            mode === "renter" ? "bg-accent text-paper" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Mountain size={12} /> Penyewa
        </button>
        <button
          onClick={() => setMode("vendor")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            mode === "vendor" ? "bg-accent text-paper" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Store size={12} /> Vendor
        </button>
      </div>
    </motion.div>
  ) : null;

  // Info bisnis vendor (mode vendor)
  const vendorInfo = effectiveMode === "vendor" && overview?.vendor ? (
    <motion.div variants={fadeUp} className="mt-6 rounded-2xl border border-surface-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Store size={16} className="text-accent" />
        <p className="text-sm font-semibold text-text-primary">Toko kamu</p>
      </div>
      <p className="mt-2 font-display text-base font-bold text-text-primary">
        {overview.vendor.business_name ?? "Usaha Tanpa Nama"}
      </p>
      {overview.vendor.description && (
        <p className="mt-1 text-xs text-text-secondary">{overview.vendor.description}</p>
      )}
      <div className="mt-2 space-y-0.5 text-xs text-text-secondary">
        {overview.vendor.address && <p>{overview.vendor.address}{overview.vendor.city ? `, ${overview.vendor.city}` : ""}</p>}
        {overview.vendor.whatsapp_number && <p>WhatsApp: {overview.vendor.whatsapp_number}</p>}
      </div>
    </motion.div>
  ) : null;

  return (
    <PageShell>
      <motion.div className="mx-auto max-w-4xl px-6 py-10" initial="hidden" animate="visible" variants={staggerContainer}>
        {profileHeader}
        {roleToggle}
        {vendorInfo}

      <motion.div variants={staggerContainer} className="mt-8 space-y-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
          {effectiveMode === "vendor" ? "Menu Vendor" : "Menu Penyewa"}
        </p>
        {menuLinks.map((link) => (
          <MenuLink key={link.href} {...link} showChevron />
        ))}
      </motion.div>

      <motion.button
        variants={fadeUp}
        onClick={handleLogout}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3 text-sm font-semibold text-text-secondary transition hover:border-red-400 hover:text-red-500"
      >
        <LogOut size={18} /> Keluar
      </motion.button>
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
  highlight,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  showChevron?: boolean;
  highlight?: boolean;
}) {
  return (
    <motion.div variants={blurReveal}>
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
          highlight ? "border-accent/30 bg-accent/5 hover:border-accent" : "border-surface-border bg-surface hover:border-accent"
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? "bg-accent/15" : "bg-accent/10"}`}>
          <Icon size={20} className="text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{label}</p>
            {highlight && <Sparkles size={12} className="text-accent" />}
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">{desc}</p>
        </div>
        {showChevron && <ChevronRight size={18} className="shrink-0 text-text-secondary" />}
      </Link>
    </motion.div>
  );
}