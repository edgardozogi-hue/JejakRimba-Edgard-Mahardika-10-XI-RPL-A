"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, Activity, Settings, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const navItems = [
  { href: "#profil", labelKey: "nav.profil", icon: User },
  { href: "#kata-sandi", labelKey: "nav.password", icon: Shield },
  { href: "#notifikasi", labelKey: "profile.notifications", icon: Bell },
  { href: "#peran", labelKey: "settings.role_section", icon: ShieldCheck },
  { href: "#sesi-aktif", labelKey: "profile.active_sessions", icon: Activity },
  { href: "#zona-bahaya", labelKey: "profile.danger_zone", icon: Settings },
] as const;

export function SidebarNav({ userName, userEmail, userRole }: { userName: string; userEmail: string; userRole: string }) {
  const { t, locale } = useLanguage();
  const pathname = usePathname();

  return (
    <aside className="space-y-4">
      {/* User Identity Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-surface-border bg-surface p-5"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 to-accent/5" />
            <div className="relative h-full w-full rounded-full bg-surface-border flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-text-primary truncate">
              {userName}
            </h3>
            <p className="mt-0.5 text-sm text-text-secondary truncate">{userEmail}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {locale === "id" ? (userRole === "vendor" ? "Vendor" : "Penyewa") : (userRole === "vendor" ? "Vendor" : "Renter")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Navigation Links */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-1"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "#profil" && pathname.includes(item.href.replace("#", "")));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector(item.href);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-accent" : "text-text-secondary"} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </motion.nav>
    </aside>
  );
}