"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowLeft, SearchX, Star, Check, X, ShoppingCart } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { useCart } from "../lib/cart";
import type { EquipmentFrontend } from "../lib/database.types";

const categoryImages: Record<string, string> = {
  Tenda: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  Carrier: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&q=80",
  "Sleeping Bag": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80",
  Kompor: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  Matras: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
  Jaket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
};

function itemImage(item: EquipmentFrontend) {
  return item.image.startsWith("http")
    ? item.image
    : categoryImages[item.category] ?? item.image;
}

export default function CatalogClient({
  items,
  categories,
  initialSearch = "",
}: {
  items: EquipmentFrontend[];
  categories: string[];
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("Semua");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState("Termurah");

  const { t } = useLanguage();
  const { addItem } = useCart();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  function handleAdd(item: EquipmentFrontend) {
    addItem({
      equipmentId: item.id,
      name: item.name,
      category: item.category,
      pricePerDay: item.pricePerDay,
      stock: item.stock,
    });
    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(
      () => setAddedMap((prev) => ({ ...prev, [item.id]: false })),
      2000
    );
  }

  const sortOptions = [
    { value: "Termurah", label: t("katalog.sort_termurah") },
    { value: "Termahal", label: t("katalog.sort_termahal") },
    { value: "Stok Terbanyak", label: t("katalog.sort_stok") },
  ];

  const categoryOptions = [
    { value: "Semua", label: t("katalog.semua") },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
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
  }, [items, category, onlyAvailable, search, sort]);

  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 rounded-2xl border border-surface-border bg-bg-elevated p-5">
        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder={t("katalog.cari_alat")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface py-2.5 pl-10 pr-4 font-archivo text-xs text-text-primary placeholder:text-text-secondary/50 caret-accent outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-3">
          <FilterGroup
            label={t("katalog.filter_kategori")}
            value={category}
            options={categoryOptions}
            onChange={setCategory}
          />

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 font-archivo text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-5 w-5 accent-accent"
              />
              {t("katalog.hanya_tersedia")}
            </label>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-surface-border bg-surface px-3 py-1 font-archivo text-[11px] text-text-primary outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="mt-6 font-archivo text-xs tracking-wide text-text-secondary">
        {filtered.length} {t("katalog.alat_ditemukan")}
      </p>

      {/* Grid */}
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="group relative overflow-hidden rounded-2xl border border-surface-border bg-surface transition-all duration-200 ease-in-out hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
            >
              <Link href={`/katalog/${item.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={itemImage(item)}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-[400ms] ease-in-out group-hover:scale-105"
                  />
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-archivo text-[10px] font-medium text-white backdrop-blur-md ${
                      item.stock > 0
                        ? "bg-sage/50"
                        : "bg-red/50"
                    }`}
                  >
                    {item.stock > 0 ? (
                      <Check size={10} className="text-green-300" />
                    ) : (
                      <X size={10} className="text-red-300" />
                    )}
                    {item.stock > 0 ? t("common.available") : t("common.sold_out")}
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 font-archivo text-[10px] text-white backdrop-blur-sm">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </span>
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/katalog/${item.id}`}>
                  <p className="font-display font-semibold text-text-primary truncate">
                    {item.name}
                  </p>
                  <p className="mt-1 truncate font-archivo text-xs text-text-secondary">
                    {item.capacity}
                  </p>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-archivo text-base font-bold text-accent">
                    Rp{item.pricePerDay.toLocaleString("id-ID")}
                    <span className="text-[10px] font-normal text-text-secondary">
                      {t("katalog.per_hari")}
                    </span>
                  </p>
                  <button
                    type="button"
                    aria-label="Tambahkan ke keranjang"
                    disabled={item.stock === 0}
                    onClick={() => handleAdd(item)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {addedMap[item.id] ? <Check size={14} /> : <ShoppingCart size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border p-16 text-center"
          >
            <SearchX size={36} className="text-text-secondary" />
            <div>
              <p className="font-display text-lg font-bold text-text-primary">
                {t("katalog.empty_title")}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {t("katalog.empty_desc")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft size={14} className="inline" /> {t("katalog.kembali_beranda")}
        </Link>
      </div>
    </div>
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
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-full min-w-0 md:w-auto">
      <p className="mb-1.5 font-archivo text-[11px] tracking-wide text-text-secondary">
        {label.toUpperCase()}
      </p>
      <div className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {options.map((opt, idx) => (
          <motion.button
            key={`${label}-${idx}`}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap rounded-xl px-3 py-1 text-xs font-medium transition ${
              value === opt.value
                ? "bg-accent text-paper"
                : "bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
