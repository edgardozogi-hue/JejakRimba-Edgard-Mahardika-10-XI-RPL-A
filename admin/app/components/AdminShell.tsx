"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ClipboardList,
  Star,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { signOut } from "@/actions/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "/";

const NAV_ITEMS = [
  { href: "/", key: "admin.nav_overview", icon: LayoutDashboard },
  { href: "/users", key: "admin.nav_users", icon: Users },
  { href: "/vendors", key: "admin.nav_vendors", icon: Store },
  { href: "/equipment", key: "admin.nav_equipment", icon: Package },
  { href: "/bookings", key: "admin.nav_bookings", icon: ClipboardList },
  { href: "/reviews", key: "admin.nav_reviews", icon: Star },
];

export default function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string | null;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    router.push(SITE_URL);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-surface-border bg-surface transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-surface-border px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-paper">
            <ShieldCheck size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-black text-text-primary">Komunitas Robotika</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Admin</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <Icon size={17} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-surface-border p-3">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
          >
            <ExternalLink size={17} />
            {t("admin.back_to_site")}
          </a>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
          >
            <LogOut size={17} />
            {t("admin.nav_logout")}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-surface-border bg-bg/80 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-2 text-right">
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-primary">
                {userName ?? t("admin.greeting")}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Administrator
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm font-black text-paper">
              {(userName?.[0] ?? "A").toUpperCase()}
            </span>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}