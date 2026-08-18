"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  User,
  Package,
  BadgeCheck,
  Mountain,
  CalendarDays,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Check,
} from "lucide-react";
import { getEquipmentById } from "../../actions/equipment";
import type { EquipmentFrontend } from "../../lib/database.types";
import {
  staggerContainer,
  fadeUp,
  spring,
} from "../../lib/animations";
import PageShell from "../../components/PageShell";
import StarRating from "../../components/StarRating";
import RatingForm from "../../components/RatingForm";
import { useCart } from "../../lib/cart";

const MAX_STOCK = 15;

const FALLBACK_IMAGE = "/placeholders/tenda.svg";

const categoryImages: Record<string, string> = {
  Tenda: "/placeholders/tenda.svg",
  Carrier: "/placeholders/carrier.svg",
  "Sleeping Bag": "/placeholders/sleeping-bag.svg",
  Kompor: "/placeholders/kompor.svg",
  Matras: "/placeholders/matras.svg",
  Jaket: "/placeholders/jaket.svg",
};

const categoryDescriptions: Record<
  string,
  (name: string, capacity?: string) => string
> = {
  Tenda: (name, cap) =>
    `${name} adalah tenda dome berkualitas tinggi yang cocok untuk pendakian gunung, camping, atau glamping.${
      cap
        ? ` Dengan kapasitas ${cap}, tenda ini cukup lega untuk perjalanan grup. `
        : " "
    }Material waterproof dan rangka kokoh memastikan kenyamanan kamu meskipun cuaca tidak menentu di pegunungan.`,
  Carrier: (name, cap) =>
    `${name} adalah carrier gunung dengan kapasitas ${
      cap || "besar"
    } yang dirancang untuk distribusi beban optimal. Cocok untuk pendakian multi-hari atau perjalanan backpacking. Dilengkapi frame ergonomis, hip belt nyaman, dan kompartemen yang memudahkan pengaturan barang bawaan.`,
  "Sleeping Bag": (name) =>
    `${name} adalah sleeping bag dengan isolasi termal yang baik untuk menjaga suhu tubuh saat tidur di alam terbuka. Cocok untuk pendakian gunung dengan suhu rendah hingga menengah. Desain ringkas dan mudah dibawa dalam carrier.`,
  Kompor: (name) =>
    `${name} adalah kompor portable yang efisien dan mudah digunakan untuk memasak di alam terbuka. Cocok untuk pendakian gunung, camping, atau cooking trip. Dengan sistem anti-wind, kompor ini tetap bekerja optimal meskipun ada angin kencang di ketinggian.`,
  Matras: (name) =>
    `${name} adalah matras lipat yang ringan dan nyaman untuk alas tidur di alam terbuka. Berfungsi sebagai isolasi dari tanah yang dingin dan lembab. Mudah dilipat dan tidak memakan banyak tempat di carrier.`,
  Jaket: (name) =>
    `${name} adalah jaket gunung waterproof dan windproof yang melindungi dari cuaca ekstrem di pegunungan. Dilengkapi hood, saku zipper, dan material breathable yang menjaga suhu tubuh tetap stabil selama pendakian.`,
};

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red/10 px-3 py-1 font-archivo text-xs font-medium text-red-600">
        <XCircle size={14} />
        Stok Habis
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1 font-archivo text-xs font-medium text-amber-600">
        <AlertTriangle size={14} />
        Sisa {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-secondary/10 px-3 py-1 font-archivo text-xs font-medium text-accent-secondary">
      <BadgeCheck size={14} />
      Tersedia
    </span>
  );
}

function StockBar({ stock }: { stock: number }) {
  const percent = Math.min((stock / MAX_STOCK) * 100, 100);
  const barColor =
    stock > 3
      ? "bg-moss"
      : stock > 0
        ? "bg-amber"
        : "bg-red";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <span className="shrink-0 font-archivo text-xs tabular-nums text-text-secondary">
        {stock}/{MAX_STOCK}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-full items-center gap-3 rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-secondary/10 text-accent-secondary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-archivo text-[11px] tracking-wide text-text-secondary">
          {label.toUpperCase()}
        </p>
        <p className="mt-0.5 truncate font-display text-sm font-semibold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-border">
          <XCircle size={32} className="text-text-secondary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Alat tidak ditemukan
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-secondary">
            Alat dengan kode &ldquo;{slug}&rdquo; tidak tersedia atau sudah tidak
            disewakan.
          </p>
        </div>
        <Link
          href="/katalog"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-display text-sm font-semibold text-paper transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} />
          Kembali ke katalog
        </Link>
      </motion.div>
    </section>
  );
}

export default function DetailAlatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [item, setItem] = useState<EquipmentFrontend | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    getEquipmentById(slug).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <PageShell>
      <section className="px-6 py-12 pb-40 md:pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-border" />
            <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
              <div className="h-64 animate-pulse rounded-2xl bg-surface md:h-96" />
              <div className="space-y-6">
                <div className="h-4 w-20 animate-pulse rounded bg-surface-border" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-surface-border" />
                <div className="h-6 w-32 animate-pulse rounded bg-surface-border" />
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  if (!item) {
    return (
      <PageShell>
        <NotFoundState slug={slug} />
      </PageShell>
    );
  }

  const description =
    categoryDescriptions[item.category]?.(item.name, item.capacity ?? undefined) ??
    `${item.name} siap untuk disewa dan digunakan dalam petualangan alam kamu.`;

  const infoCards = [
    { icon: <MapPin size={18} />, label: "Lokasi", value: item.location },
    { icon: <User size={18} />, label: "Mitra", value: item.provider },
    ...(item.capacity
      ? [{ icon: <Package size={18} />, label: "Kapasitas", value: item.capacity }]
      : []),
    { icon: <BadgeCheck size={18} />, label: "Kondisi", value: item.condition },
    {
      icon: <Mountain size={18} />,
      label: "Elevasi",
      value: item.elevation && item.elevation.trim() ? item.elevation : "\u2014",
    },
  ];

  function handleAddToCart() {
    if (!item) return;
    addItem({
      equipmentId: item.id,
      name: item.name,
      category: item.category,
      pricePerDay: item.pricePerDay,
      stock: item.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const mainImg = imgError
    ? FALLBACK_IMAGE
    : item.image.startsWith("http")
      ? item.image
      : categoryImages[item.category];

  return (
    <PageShell>
      <section className="px-4 py-8 pb-24 sm:px-6 md:px-4 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
          >
            <Link
              href="/katalog"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} />
              Kembali ke katalog
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
          >
            {/* â”€â”€â”€ LEFT COLUMN: Gallery + Info (sticky) â”€â”€â”€ */}
            <motion.div
              variants={fadeUp}
              className="lg:sticky lg:top-24 lg:col-span-5 lg:h-fit"
            >
              <div className="relative">
                {/* Main image */}
                <div className="relative aspect-[4/3] max-h-[380px] w-full overflow-hidden rounded-2xl border border-surface-border bg-bg-elevated">
                  <img
                    src={mainImg}
                    onError={() => setImgError(true)}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                  />
                </div>
                {/* Category floating badge */}
                <span className="absolute left-3 top-3 inline-block rounded-full bg-paper/90 px-3 py-1 font-archivo text-xs font-medium tracking-wide text-bark shadow-sm backdrop-blur-none">
                  {item.category}
                </span>
                {/* Dots indicator (floating overlay) */}
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/10 px-2.5 py-1 backdrop-blur-sm dark:bg-black/40">
                  {[0, 1, 2, 3].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={`Foto ${i + 1} ${item.name}`}
                      className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-all duration-200 ${
                        activeImg === i
                          ? "scale-125 bg-accent"
                          : "bg-text-secondary/60 hover:bg-text-secondary/90"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Info cards grid 2x2 (below photo) */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {infoCards.map((card, i) => (
                  <InfoCard key={i} {...card} />
                ))}
              </div>
            </motion.div>

            {/* â”€â”€â”€ RIGHT COLUMN: Action & Detail (7/12) â”€â”€â”€ */}
            <motion.div variants={fadeUp} className="space-y-6 lg:col-span-7">
              {/* Category label */}
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 font-archivo text-xs font-medium tracking-wide text-accent">
                {item.category.toUpperCase()}
              </span>

              {/* Name */}
              <h1 className="font-display text-3xl font-bold leading-tight text-text-primary md:text-4xl">
                {item.name}
              </h1>

              {/* Price + availability badge */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-archivo text-3xl font-bold text-accent">
                  Rp{item.pricePerDay.toLocaleString("id-ID")}
                  <span className="text-base font-normal text-text-secondary">
                    {" "}
                    /hari
                  </span>
                </p>
                <StockBadge stock={item.stock} />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={item.rating} size={16} />
                <span className="font-display text-sm text-text-secondary">
                  {item.rating} ({item.reviewCount} ulasan)
                </span>
              </div>

              {/* CTA button â€” above the fold */}
              <Link
                href={`/booking/${item.id}`}
                className="hidden w-full items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-display text-base font-semibold text-paper shadow-sm transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:flex"
              >
                <CalendarDays size={20} />
                Sewa Sekarang
              </Link>

              <button
                type="button"
                onClick={handleAddToCart}
                className="hidden w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-8 py-4 font-display text-base font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:flex"
              >
                {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                {added ? "Ditambahkan ke Keranjang" : "Tambah ke Keranjang"}
              </button>

              {/* Divider */}
              <div className="h-px w-full bg-surface-border" />

              {/* Stock bar */}
              <div className="space-y-2">
                <p className="font-archivo text-xs tracking-wide text-text-secondary">
                  STOK
                </p>
                <StockBar stock={item.stock} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="font-archivo text-xs tracking-[0.15em] text-accent">
                  DESKRIPSI
                </p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {description}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* â”€â”€ FULL-WIDTH REVIEWS ABOVE FOOTER â”€â”€ */}
          <RatingForm equipmentId={item.id} />

          {/* Mobile sticky CTA */}
          {typeof document !== "undefined" &&
            createPortal(
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-surface-border bg-surface/95 px-4 pt-3 pb-2 backdrop-blur md:hidden"
              >
                <Link
                  href={`/booking/${item.id}`}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-8 py-3.5 font-display text-base font-semibold text-paper shadow-lg transition hover:bg-accent-hover"
                >
                  <CalendarDays size={20} />
                  Sewa Sekarang
                </Link>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-8 py-3 font-display text-sm font-semibold text-accent transition hover:bg-accent/10"
                >
                  {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {added ? "Ditambahkan" : "Tambah ke Keranjang"}
                </button>
              </motion.div>,
              document.body,
            )}
        </div>
      </section>
    </PageShell>
  );
}
