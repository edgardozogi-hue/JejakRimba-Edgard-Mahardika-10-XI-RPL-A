"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { equipmentList } from "../../lib/data";
import {
  staggerContainer,
  fadeUp,
  spring,
  springSnappy,
} from "../../lib/animations";
import PageShell from "../../components/PageShell";
import StarRating from "../../components/StarRating";

const MAX_STOCK = 15;

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

function formatElevation(raw: string): string {
  const num = parseInt(raw, 10);
  return num >= 1000
    ? `${(num / 1000).toFixed(1).replace(".", ",")}`
    : `${num}`;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red/10 px-3 py-1 font-mono text-xs font-medium text-red-600">
        <XCircle size={14} />
        Stok Habis
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1 font-mono text-xs font-medium text-amber-600">
        <AlertTriangle size={14} />
        Sisa {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-secondary/10 px-3 py-1 font-mono text-xs font-medium text-accent-secondary">
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
      <span className="shrink-0 font-mono text-xs tabular-nums text-text-secondary">
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
    <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-secondary/10 text-accent-secondary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-wide text-text-secondary">
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

  const item = equipmentList.find((e) => e.id === slug);

  if (!item) {
    return (
      <PageShell>
        <NotFoundState slug={slug} />
      </PageShell>
    );
  }

  const elevationDisplay = formatElevation(item.elevation);
  const description =
    categoryDescriptions[item.category]?.(item.name, item.capacity) ??
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
      value: `≥ ${elevationDisplay} mdpl`,
    },
  ];

  return (
    <PageShell>
      <section className="px-6 py-12 pb-24 md:pb-12">
        <div className="mx-auto max-w-6xl">
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
            className="grid gap-8 md:grid-cols-2 md:gap-12"
          >
            {/* ─── LEFT COLUMN: Hero Image ─── */}
            <motion.div variants={fadeUp} className="relative">
              <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-surface-border bg-bg-elevated md:h-96">
                <img
                  src={categoryImages[item.category]}
                  alt={item.name}
                  className="h-full w-full object-contain p-6"
                  loading="eager"
                />
              </div>
              {/* Category floating badge */}
              <span className="absolute left-3 top-3 inline-block rounded-full bg-paper/90 px-3 py-1 font-mono text-xs font-medium tracking-wide text-bark shadow-sm backdrop-blur-none">
                {item.category}
              </span>
            </motion.div>

            {/* ─── RIGHT COLUMN: Information ─── */}
            <div className="space-y-6">
              {/* Category label */}
              <motion.div variants={fadeUp}>
                <span className="inline-block rounded-full bg-accent/10 px-3 py-1 font-mono text-xs font-medium tracking-wide text-accent">
                  {item.category.toUpperCase()}
                </span>
              </motion.div>

              {/* Name */}
              <motion.div variants={fadeUp}>
                <h1 className="font-display text-3xl font-bold leading-tight text-text-primary md:text-4xl">
                  {item.name}
                </h1>
              </motion.div>

              {/* Price */}
              <motion.div variants={fadeUp}>
                <p className="font-mono text-3xl font-bold text-accent">
                  Rp{item.pricePerDay.toLocaleString("id-ID")}
                  <span className="text-base font-normal text-text-secondary">
                    {" "}
                    /hari
                  </span>
                </p>
              </motion.div>

              {/* Stock badge */}
              <motion.div variants={fadeUp}>
                <StockBadge stock={item.stock} />
              </motion.div>

              {/* Rating */}
              <motion.div variants={fadeUp} className="flex items-center gap-2">
                <StarRating rating={item.rating} size={16} />
                <span className="font-display text-sm text-text-secondary">
                  {item.rating} ({item.reviewCount} ulasan)
                </span>
              </motion.div>

              {/* Info cards grid */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-2 gap-3"
              >
                {infoCards.map((card, i) => (
                  <InfoCard key={i} {...card} />
                ))}
              </motion.div>

              {/* Stock bar */}
              <motion.div variants={fadeUp} className="space-y-2">
                <p className="font-mono text-xs tracking-wide text-text-secondary">
                  STOK
                </p>
                <StockBar stock={item.stock} />
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={fadeUp}
                className="h-px w-full bg-surface-border"
              />

              {/* Description */}
              <motion.div variants={fadeUp} className="space-y-2">
                <p className="font-mono text-xs tracking-[0.15em] text-accent">
                  DESKRIPSI
                </p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {description}
                </p>
              </motion.div>

              {/* CTA button */}
              <motion.div
                variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={springSnappy}
              >
                <Link
                  href={`/booking/${item.id}`}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-8 py-4 font-display text-base font-semibold text-paper shadow-sm transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <CalendarDays size={20} />
                  Sewa Sekarang
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
