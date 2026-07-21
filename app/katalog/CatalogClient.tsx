"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Search, MapPin, ArrowLeft, SearchX } from "lucide-react";
import { Equipment } from "../lib/data";
import { staggerContainer, spring, fadeUp } from "../lib/animations";

const categoryImages: Record<string, string> = {
  Tenda: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  Carrier: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&q=80",
  "Sleeping Bag": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80",
  Kompor: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  Matras: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
  Jaket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
};

const MAX_STOCK = 15;

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
      }}
    >
      {children}
    </motion.div>
  );
}

export default function CatalogClient({
  items,
  locations,
  categories,
}: {
  items: Equipment[];
  locations: string[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Semua");
  const [category, setCategory] = useState("Semua");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState("Termurah");

  const filtered = useMemo(() => {
    let result = items.filter((item) => {
      if (location !== "Semua" && item.location !== location) return false;
      if (category !== "Semua" && item.category !== category) return false;
      if (onlyAvailable && item.stock === 0) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });

    switch (sort) {
      case "Termurah":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "Termahal":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "Stok Terbanyak":
        result.sort((a, b) => b.stock - a.stock);
        break;
    }

    return result;
  }, [items, location, category, onlyAvailable, search, sort]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Filters */}
      <motion.div
        variants={fadeUp}
        className="space-y-4 rounded-2xl border border-surface-border bg-bg-elevated p-5"
      >
        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Cari alat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface py-2.5 pl-10 pr-4 font-mono text-xs text-text-primary placeholder:text-text-secondary/50 caret-accent outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <FilterGroup
            label="Lokasi"
            value={location}
            options={["Semua", ...locations]}
            onChange={setLocation}
          />
          <FilterGroup
            label="Kategori"
            value={category}
            options={["Semua", ...categories]}
            onChange={setCategory}
          />

          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Hanya yang tersedia
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface px-3 py-1 font-mono text-[11px] text-text-primary outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
          >
            <option value="Termurah">Termurah</option>
            <option value="Termahal">Termahal</option>
            <option value="Stok Terbanyak">Stok Terbanyak</option>
          </select>
        </div>
      </motion.div>

      {/* Result count */}
      <motion.p
        variants={fadeUp}
        className="mt-6 font-mono text-xs tracking-wide text-text-secondary"
      >
        {filtered.length} alat ditemukan
      </motion.p>

      {/* Grid */}
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => {
            const stockPercent = Math.min(
              (item.stock / MAX_STOCK) * 100,
              100,
            );
            const stockBarColor =
              item.stock > 3
                ? "bg-moss"
                : item.stock > 0
                  ? "bg-amber"
                  : "bg-red";

            return (
              <TiltCard key={item.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={spring}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="overflow-hidden rounded-2xl border border-surface-border bg-surface"
                >
                  <Link href={`/katalog/${item.id}`}>
                    {/* Image placeholder */}
                    <div className="flex h-32 w-full items-center justify-center overflow-hidden bg-bg-elevated">
                      <img
                        src={categoryImages[item.category]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Stock indicator bar */}
                    <div className="h-1 w-full bg-surface-border">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${stockBarColor}`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display font-bold leading-tight text-text-primary">
                          {item.name}
                        </p>
                        <span
                          className={`shrink-0 rounded-xl px-2 py-0.5 font-mono text-[11px] ${
                            item.stock > 0
                              ? "bg-accent-secondary/15 text-accent-secondary"
                              : "bg-accent/15 text-accent"
                          }`}
                        >
                          {item.stock > 0 ? `${item.stock} unit` : "Habis"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 font-mono text-xs text-text-secondary">
                        <p className="flex items-center gap-1">
                          <MapPin size={12} /> {item.location}
                        </p>
                        <p>Mitra: {item.provider}</p>
                        {item.capacity && <p>Kapasitas: {item.capacity}</p>}
                        <p>Kondisi: {item.condition}</p>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <p className="font-mono text-lg text-accent">
                          Rp{item.pricePerDay.toLocaleString("id-ID")}
                          <span className="text-xs text-text-secondary">
                            {" "}/hari
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </TiltCard>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={spring}
            className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border p-16 text-center"
          >
            <SearchX size={36} className="text-text-secondary" />
            <div>
              <p className="font-display text-lg font-bold text-text-primary">
                Belum ada alat yang cocok
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Coba ganti filter lokasi atau kategori di atas.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} className="mt-16 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft size={14} className="inline" /> Kembali ke beranda
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-text-secondary">
        {label.toUpperCase()}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <motion.button
            key={opt}
            onClick={() => onChange(opt)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            className={`rounded-xl px-3 py-1 text-xs font-medium transition ${
              value === opt
                ? "bg-accent text-paper"
                : "bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

