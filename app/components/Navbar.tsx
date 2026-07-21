"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Search, Sun, LogOut } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { supabase } from "../lib/supabase";
import { springSnappy } from "../lib/animations";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/booking", label: "Booking Saya" },
  { href: "/profil", label: "Profil" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setUser({
          name: meta?.full_name ?? meta?.name ?? data.user.email?.split("@")[0] ?? "User",
          email: data.user.email ?? "",
        });
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          name: meta?.full_name ?? meta?.name ?? session.user.email?.split("@")[0] ?? "User",
          email: session.user.email ?? "",
        });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const underlineSpring = { type: "spring", stiffness: 400, damping: 35 } as const;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-nav-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-text-primary"
        >
          Jejak Rimba
        </Link>

        <nav className="hidden items-center gap-0.5 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? "font-semibold text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-accent"
                    transition={underlineSpring}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={toggle}
            aria-label="Ganti tema"
            whileHover={{ scale: 1.15, rotate: 20 }}
            whileTap={{ scale: 0.85 }}
            transition={springSnappy}
            className="rounded-full p-2 text-text-secondary hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme === "dark" ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <motion.button
            aria-label="Cari alat"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            transition={springSnappy}
            className="hidden rounded-full p-2 text-text-secondary hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:inline-flex"
          >
            <Search size={18} />
          </motion.button>

          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={springSnappy}>
                <Link
                  href="/profil"
                  className="flex items-center gap-2 rounded-full bg-bg-elevated px-3 py-1.5 text-sm font-semibold text-text-primary hover:ring-1 hover:ring-accent"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-paper">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </Link>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                aria-label="Keluar"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                transition={springSnappy}
                className="rounded-full p-2 text-text-secondary hover:bg-surface hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <LogOut size={18} />
              </motion.button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} transition={springSnappy}>
              <Link
                href="/masuk"
                className="block rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-paper hover:bg-accent-hover"
              >
                Masuk
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
