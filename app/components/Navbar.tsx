"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Moon,
  Search,
  Sun,
  User,
  ChevronDown,
  Globe,
  ClipboardList,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "../lib/i18n";
import { supabase } from "../lib/supabase";
import { useCart } from "../lib/cart";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.beranda" },
  { href: "/katalog", labelKey: "nav.katalog" },
];

const QUICK_SEARCHES = [
  "Tenda",
  "Carrier",
  "Sleeping Bag",
  "Kompor",
  "Jaket",
  "Matras",
];

const POPULAR_GEAR = [
  "Dome",
  "Ultralight",
  "60L",
  "80L",
  "Windproof",
  "Waterproof",
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(term?: string) {
    const q = (term ?? query).trim();
    router.push(q ? `/katalog?q=${encodeURIComponent(q)}` : "/katalog");
    setSearchOpen(false);
    setQuery("");
  }

  const underlineSpring = { type: "spring", stiffness: 400, damping: 35 } as const;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-nav-bg">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 py-4 pl-2 pr-2">
        {/* Brand + inline SVG logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-text-primary"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9.5" />
            <path d="M4.5 15.5 8.5 11l2.5 3 3-4.5 5 6" />
            <circle cx="15.5" cy="7" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          Jejak Rimba
        </Link>

{/* Desktop search bar (persistent input) + center nav */}
        <div className="flex flex-1 items-center justify-center relative">
          {/* Center nav links (absolute center) */}
          <nav className="hidden items-center gap-0.5 text-sm font-medium md:flex absolute left-1/2 -translate-x-1/2">
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
                  {t(item.labelKey)}
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

          {/* Desktop persistent search input (right of center) */}
          <div className="hidden max-w-sm md:block ml-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="relative"
            >
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder={t("nav.cari_placeholder")}
                className="w-full rounded-full border border-surface-border bg-surface pl-7 pr-4 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
                aria-label={t("nav.cari_label")}
              />
            </form>
          </div>
        </div>

        {/* Right utilities group: Theme → Language → Profile (all in one wrapper, pushed to far right) */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Cart */}
          <Link
            href="/booking/keranjang"
            aria-label="Keranjang sewa"
            className="relative rounded-full p-2 text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-paper">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <motion.button
            onClick={toggle}
            aria-label="Ganti tema"
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

          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => {
                setLangOpen((v) => !v);
                setProfileOpen(false);
              }}
              aria-label={t("nav.bahasa")}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 rounded-full p-2 text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Globe size={18} />
              <span className="hidden text-xs font-semibold md:inline">{locale.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-surface-border bg-surface p-1 shadow-2xl"
                >
                  {(["id", "en"] as const).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLocale(code);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-bg-elevated ${
                        locale === code
                          ? "font-semibold text-accent"
                          : "text-text-secondary"
                      }`}
                    >
                      {code === "id" ? t("nav.bahasa_id") : t("nav.bahasa_en")}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User / login area */}
          {loading ? null : user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setLangOpen(false);
                }}
                aria-label="Menu profil"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-full bg-bg-elevated p-1.5 text-sm font-semibold text-text-primary transition hover:ring-1 hover:ring-accent"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-paper">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[10rem] truncate md:inline">
                  {user.name}
                </span>
                <ChevronDown
                  size={16}
                  className={`hidden text-text-secondary transition-transform duration-200 md:inline ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-surface-border bg-surface p-1 shadow-2xl"
                  >
                    <div className="border-b border-surface-border px-3 py-2.5">
                      <p className="truncate font-display text-sm font-bold text-text-primary">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-text-secondary">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profil"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <User size={16} className="text-text-secondary" />
                      {t("nav.profil")}
                    </Link>
                    <Link
                      href="/booking"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <ClipboardList size={16} className="text-text-secondary" />
                      {t("nav.booking")}
                    </Link>
                    <Link
                      href="/profil/pengaturan"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <Settings size={16} className="text-text-secondary" />
                      {t("nav.pengaturan")}
                    </Link>
                    <div className="my-1 border-t border-surface-border" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/masuk"
              className="block rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-paper hover:bg-accent-hover"
            >
              {t("nav.masuk")}
            </Link>
          )}
        </div>
      </div>

      {/* Search modal (mobile / Ctrl+K) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-bark/60 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative flex h-full flex-col overflow-hidden bg-surface md:mx-auto md:mt-20 md:h-auto md:w-[calc(100%-2rem)] md:max-w-lg md:rounded-2xl md:border md:border-surface-border md:shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-surface-border px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] md:pt-3">
                <Search size={18} className="shrink-0 text-text-secondary" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder={t("nav.cari_placeholder")}
                  className="w-full bg-transparent font-display text-sm text-text-primary outline-none placeholder:text-text-secondary/50"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="font-archivo text-[11px] tracking-wide text-text-secondary">
                  {t("nav.pencarian_cepat")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map((s) => (
                    <button
                      key={s}
                      onClick={() => submitSearch(s)}
                      className="rounded-full border border-surface-border bg-bg-elevated px-3 py-1.5 font-archivo text-xs text-text-secondary transition hover:border-accent/40 hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <p className="mt-6 font-archivo text-[11px] tracking-wide text-text-secondary">
                  {t("nav.kategori_populer")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POPULAR_GEAR.map((s) => (
                    <button
                      key={s}
                      onClick={() => submitSearch(s)}
                      className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 font-archivo text-xs text-accent transition hover:bg-accent/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}