"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ArrowUpFromLine,
  Loader,
  Compass,
  Flame,
  Check,
  X,
  MapPin,
  Mountain,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getEquipmentList } from "./actions/equipment";
import type { EquipmentFrontend } from "./lib/database.types";
import PageShell from "./components/PageShell";
import {
  fadeUp,
  staggerContainer,
  spring,
} from "./lib/animations";
import { useLanguage } from "./lib/i18n";

const journeyStops = [
  {
    elevation: "0800",
    label: "Basecamp",
    desc: "Tenda, matras, dan perlengkapan dasar buat mendirikan camp pertama.",
    img: "/asset/rute_perjalanan/tenda_besar.jpg",
    gear: "Tenda",
    point: [90, 248] as [number, number],
  },
  {
    elevation: "1600",
    label: "Pos Bayangan",
    desc: "Sleeping bag dan carrier buat perjalanan yang lebih jauh.",
    img: "/asset/rute_perjalanan/tas.jpg",
    gear: "Carrier",
    point: [300, 185] as [number, number],
  },
  {
    elevation: "2400",
    label: "Jalur Tanjakan",
    desc: "Jaket gunung dan alat masak buat cuaca yang mulai berubah.",
    img: "/asset/rute_perjalanan/jaket.jpg",
    gear: "Jaket",
    point: [520, 132] as [number, number],
  },
  {
    elevation: "2700+",
    label: "Menuju Puncak",
    desc: "Perlengkapan kapasitas besar buat tim pendakian rombongan.",
    img: "/asset/rute_perjalanan/tenda_kecil.jpg",
    gear: "Tenda",
    point: [740, 78] as [number, number],
  },
];

const profilePaddedPoints: [number, number][] = [
  [12, 264],
  ...(journeyStops.map((s) => s.point) as [number, number][]),
  [888, 116],
];

function buildSmoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const profileLinePath = buildSmoothPath(profilePaddedPoints);
const profileAreaPath = `${profileLinePath} L 900,300 L 0,300 Z`;

const howItWorksSteps = [
  {
    icon: Compass,
    titleKey: "home.how_step1_title",
    descKey: "home.how_step1_desc",
  },
  {
    icon: Flame,
    titleKey: "home.how_step2_title",
    descKey: "home.how_step2_desc",
  },
  {
    icon: CalendarCheck,
    titleKey: "home.how_step3_title",
    descKey: "home.how_step3_desc",
  },
  {
    icon: MapPin,
    titleKey: "home.how_step4_title",
    descKey: "home.how_step4_desc",
  },
];

const partners = ["Rimba Gear Malang", "Alas Camp Batu", "Basecamp Lawang"];

const marqueeTestimonials = [
  {
    name: "Rian Pratama",
    asal: "Malang Raya",
    rating: 5.0,
    quote:
      "Carrier-nya pas banget di badan, waist belt nyaman dipakai untuk pendakian 2 hari.",
    mountain: "MT. ARJUNO 3.339 MDPL",
    gear: "TENDA DOME & CARRIER",
    photo:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  },
  {
    name: "Salsabila Azzahra",
    asal: "Batu",
    rating: 4.5,
    quote:
      "Jaketnya tebal dan hangat, cocok buat bivak di pos bayangan saat cuaca dingin.",
    mountain: "MT. PENANGGUNGAN 1.653 MDPL",
    gear: "JAKET GUNUNG & SLEEPING BAG",
    photo:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    name: "Dimas Anggara",
    asal: "Lawang",
    rating: 5.0,
    quote:
      "Kompor portablenya menyala stabil di ketinggian, matrasnya empuk buat tidur malam.",
    mountain: "MT. WELIRANG 3.156 MDPL",
    gear: "KOMPOR PORTABLE & MATRAS",
    photo:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
  },
  {
    name: "Putri Ramadhani",
    asal: "Malang Kota",
    rating: 4.5,
    quote:
      "Tenda dome 4P-nya gampang didirikan, waterproof beneran pas hujan deras di puncak.",
    mountain: "MT. BROMO 2.329 MDPL",
    gear: "TENDA DOME 4P",
    photo:
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80",
  },
  {
    name: "Fajar Setiawan",
    asal: "Malang Raya",
    rating: 5.0,
    quote:
      "Bookingnya cepat, barang langsung tersedia di titik ambil. Adil banget harganya per hari.",
    mountain: "MT. SEMERU 3.676 MDPL",
    gear: "CARRIER 60L",
    photo:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  },
  {
    name: "Nadia Soraya",
    asal: "Batu",
    rating: 4.5,
    quote:
      "Sepatu boot dan jaket lentur dipakai, lengkap tanpa drama. Rekomendasi buat rombongan besar.",
    mountain: "MT. RAUNG 3.344 MDPL",
    gear: "JAKET GUNUNG & SEPATU BOOT",
    photo:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
];

function Counter({ value, label }: { value: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.round(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="border-l border-paper/15 pl-5">
      <p className="font-mono text-3xl font-bold text-ember-light md:text-4xl">
        {count}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim/70">
        {label}
      </p>
    </div>
  );
}

function SectionHead({
  no,
  kicker,
  title,
  desc,
  center = false,
}: {
  no: string;
  kicker: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : ""} max-w-2xl`}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
        {no} <span>{`///`}</span> {kicker}
      </p>
      <h2 className="mt-4 font-display text-4xl font-black uppercase leading-[0.92] tracking-tight text-text-primary md:text-5xl">
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-base leading-relaxed text-text-secondary md:text-lg ${
            center ? "mx-auto" : ""
          }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

function TestimonialCard({ t }: { t: (typeof marqueeTestimonials)[number] }) {
  return (
    <div className="mr-6 flex w-[300px] shrink-0 flex-col justify-between border border-surface-border bg-bg/40 p-6 md:w-[360px]">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-surface-border pb-3">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
            <MapPin size={12} />
            {t.mountain}
          </span>
          <span className="truncate font-mono text-[10px] uppercase tracking-wider text-text-secondary">
            {t.gear}
          </span>
        </div>

        <blockquote className="mt-5 font-display text-base italic leading-relaxed text-text-primary">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-surface-border pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent font-mono text-xs font-bold text-paper">
            {t.name
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-display text-sm font-bold uppercase text-text-primary">
              {t.name}
            </h4>
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
              {t.asal}
            </p>
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs tracking-widest text-amber-400">
          {"★".repeat(Math.round(t.rating))}
          <span className="ml-1 text-[10px] text-text-secondary/60">
            ({t.rating.toFixed(1)})
          </span>
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState<EquipmentFrontend[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getEquipmentList().then((equipData) => {
      setEquipment(equipData);
      const locs = [...new Set(equipData.map((e) => e.location))].filter(Boolean);
      setLocations(locs);
      setDataLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalStock = equipment.reduce((sum, e) => sum + (e.stock ?? 0), 0);
  const currentStop = journeyStops[activeTab];
  const stockCount = dataLoading ? 0 : equipment.length;

  return (
    <PageShell>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 text-paper md:pt-28">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 contour-lines" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark/90 via-bark/55 to-bark/15" />
        <motion.div
          className="relative z-10 mx-auto max-w-6xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="border border-paper/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-ember-light md:inline-block"
          >
            {t("home.location_tag")}
          </motion.p>

          <motion.h1
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="mt-8 max-w-4xl font-display text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
          >
            {["Alat", "mendaki", "tersedia,"].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="mr-[0.28em] inline-block"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.2,
                  },
                },
              }}
              className="inline-block text-moss-light"
            >
              {t("home.hero_suffix")}
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-base leading-relaxed text-paper-dim md:text-lg"
          >
            {t("home.hero_desc")}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/katalog"
              className="block bg-ember px-7 py-3 font-display text-sm font-bold uppercase tracking-widest text-paper transition hover:bg-ember-light"
            >
              {t("home.cta_katalog")}
            </Link>
            <a
              href="#alur"
              className="block border border-paper/30 px-7 py-3 font-display text-sm font-bold uppercase tracking-widest text-paper transition hover:border-paper/70 hover:text-paper"
            >
              {t("home.cta_how")}
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-16 flex flex-wrap gap-10 font-archivo"
          >
            <Counter value={totalStock} label={t("home.stats_alat")} />
            <Counter value={locations.length} label={t("home.stats_lokasi")} />
            <Counter value={3} label={t("home.stats_mitra")} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── JOURNEY ── */}
      <section id="alur" className="border-b border-surface-border bg-bg px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead
              no="01"
              kicker={t("home.journey_kicker")}
              title={t("home.journey_title")}
            />
            <p className="max-w-sm border-l-2 border-accent pl-4 text-sm leading-relaxed text-text-secondary">
              {t("home.journey_desc")}
            </p>
          </div>

          {/* Elevation profile chart */}
          <div className="relative w-full select-none">
            <div className="relative aspect-[900/300] w-full">
              <svg
                viewBox="0 0 900 300"
                className="h-full w-full"
                role="img"
                aria-label="Profil ketinggian jalur pendakian, pilih pos untuk melihat rekomendasi peralatan"
              >
                <defs>
                  <linearGradient id="profile-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <line
                  x1="5"
                  y1="294"
                  x2="895"
                  y2="294"
                  stroke="var(--surface-border)"
                  strokeWidth="1"
                />
                <path d={profileAreaPath} fill="url(#profile-fill)" />
                <line
                  x1={journeyStops[activeTab].point[0]}
                  y1={journeyStops[activeTab].point[1]}
                  x2={journeyStops[activeTab].point[0]}
                  y2={292}
                  stroke="var(--accent)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                <path
                  d={profileLinePath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                />
              </svg>

              {journeyStops.map((stop, idx) => {
                const isActive = activeTab === idx;
                const [px, py] = stop.point;
                return (
                  <button
                    key={stop.elevation}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    aria-pressed={isActive}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    style={{
                      left: `${(px / 900) * 100}%`,
                      top: `${(py / 300) * 100}%`,
                    }}
                  >
                    <span className="flex flex-col items-center">
                      <span
                        className={`block h-4 w-4 border-2 transition-all duration-300 ${
                          isActive
                            ? "scale-110 bg-accent shadow-[0_0_0_6px_rgba(196,98,45,0.22)]"
                            : "bg-text-secondary/50 group-hover:bg-accent"
                        }`}
                        style={{ borderColor: "var(--surface)" }}
                      />
                      <span className="mt-3 max-w-[96px] border border-surface-border bg-surface px-2 py-1 text-center font-mono text-[10px] uppercase leading-tight text-text-secondary transition-colors group-hover:border-accent/50 group-hover:text-accent">
                        <span className={`font-bold ${isActive ? "text-accent" : ""}`}>
                          {stop.label}
                        </span>
                        <span className="text-text-secondary/70"> {stop.elevation}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showcase board */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="mt-10 grid grid-cols-1 gap-0 border border-surface-border bg-surface md:grid-cols-12"
            >
              {/* Left: info & gear */}
              <div className="space-y-6 border-b border-surface-border p-6 md:col-span-5 md:border-b-0 md:border-r md:p-8">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 border border-accent/40 bg-accent/10 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
                    <Mountain size={14} />
                    Pos {activeTab + 1} · {currentStop.elevation} MDPL
                  </div>
                  <h3 className="font-display text-3xl font-black uppercase leading-none tracking-tight text-text-primary">
                    {currentStop.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {currentStop.desc}
                  </p>
                </div>

                <div className="border border-surface-border bg-bg p-4">
<span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-accent">
                      <ShieldCheck size={16} /> {t("home.gear_required")}
                    </span>
                  <p className="mt-2 font-display text-lg font-bold uppercase text-text-primary">
                    {currentStop.gear}
                  </p>
                </div>

                <Link
                  href={`/katalog?q=${encodeURIComponent(currentStop.gear)}`}
                  className="group inline-flex items-center gap-2 border-2 border-accent bg-accent px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-paper transition hover:bg-accent-hover"
                >
                  {t("home.view_recommendations")} {currentStop.label}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* Right: cinematic photo */}
              <div className="relative md:col-span-7">
                <div className="relative aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[320px]">
                  <img
                    src={currentStop.img}
                    alt={currentStop.label}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 bg-bark px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-paper">
                    Jalur #{activeTab + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            no="02"
            kicker={t("home.how_kicker")}
            title={t("home.how_title")}
            desc={t("home.how_desc")}
          />
          <ol className="mt-14 divide-y divide-surface-border border-y border-surface-border">
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.titleKey}
                  className="group grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:items-center md:gap-6"
                >
                  <span className="font-mono text-sm font-bold text-accent md:col-span-2">
                    0{i + 1}
                  </span>
                  <div className="flex items-center gap-4 md:col-span-4">
                    <Icon
                      size={22}
                      className="text-text-secondary transition-colors group-hover:text-accent"
                    />
                    <h3 className="font-display text-2xl font-black uppercase tracking-tight text-text-primary md:text-3xl">
                      {t(step.titleKey)}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary md:col-span-6">
                    {t(step.descKey)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="border-y border-surface-border bg-bg-elevated px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary">
            {t("home.trusted_by")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-display text-xl font-black uppercase tracking-widest text-text-secondary/60 md:text-2xl">
            {partners.map((name, i) => (
              <span key={name} className="flex items-center gap-10">
                {name}
                {i < partners.length - 1 && (
                  <span className="text-accent/40" aria-hidden="true">
                    /
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="bg-bg-elevated px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead
              no="03"
              kicker={t("home.products_kicker")}
              title={t("home.products_title")}
            />
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 border-b border-accent pb-1 font-mono text-xs font-semibold uppercase tracking-widest text-accent transition hover:text-accent-hover"
            >
              {t("home.view_all_catalog")} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px border border-surface-border bg-surface-border sm:grid-cols-2 lg:grid-cols-4">
            {dataLoading ? (
              <div className="col-span-1 flex items-center justify-center bg-bg-elevated py-16 sm:col-span-2 lg:col-span-4">
                <Loader size={24} className="animate-spin text-text-secondary" />
              </div>
            ) : (
              <>
                {equipment.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/katalog/${item.id}`}
                    className="group flex flex-col bg-surface transition-colors duration-200 hover:bg-bg-elevated"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-surface-border">
                      <img
                        src={
                          {
                            Tenda: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
                            Carrier: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&q=80",
                            "Sleeping Bag": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80",
                            Kompor: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
                            Matras: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
                            Jaket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
                          }[item.category]
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <span
                        className={`absolute left-3 top-3 flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white ${
                          item.stock > 0 ? "bg-sage" : "bg-red"
                        }`}
                      >
                        {item.stock > 0 ? (
                          <Check size={10} className="text-green-300" />
                        ) : (
                          <X size={10} className="text-red-300" />
                        )}
                        {item.stock > 0 ? t("common.available") : t("common.sold_out")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="font-display text-base font-bold uppercase tracking-tight text-text-primary">
                        {item.name}
                      </p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                        {item.location} ∕ {item.provider}
                      </p>
                      <p className="mt-4 font-mono text-lg font-bold text-accent">
                        Rp{item.pricePerDay.toLocaleString("id-ID")}
                        <span className="text-[10px] font-normal text-text-secondary">
                          {" "}/hari
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}

{/* Portal card */}
                <Link
                  href="/katalog"
                  className="group flex min-h-[15rem] flex-col items-center justify-center border border-current bg-surface p-6 text-center transition-colors hover:bg-accent/5"
                >
                  <p className="font-display text-5xl font-black uppercase tracking-tight text-accent">
                    {stockCount}
                  </p>
                  <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-widest text-text-primary">
                    {t("home.gear_ready")}
                  </p>
                  <p className="mt-3 max-w-[13rem] text-sm text-text-secondary">
                    {t("home.gear_ready_desc")}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 border-2 border-accent px-5 py-2 font-display text-xs font-bold uppercase tracking-widest text-accent transition group-hover:bg-accent group-hover:text-paper">
                    {t("home.view_all_catalog")} <ArrowRight size={14} />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── TESTIMONI ── */}
      <section className="border-t border-surface-border bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead
              no="04"
              kicker={t("home.testimonials_kicker")}
              title={t("home.testimonials_title")}
            />
            <p className="max-w-md border-l-2 border-accent pl-4 text-sm leading-relaxed text-text-secondary">
              {t("home.testimonials_desc")}
            </p>
          </div>

          <div className="group relative overflow-hidden py-2">
            <div className="marquee-track flex w-max">
              {[false, true].map((dup, i) => (
                <div key={i} className="flex" aria-hidden={dup || undefined}>
                  {marqueeTestimonials.map((t) => (
                    <TestimonialCard key={t.name + i} t={t} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-surface-border bg-bg-elevated px-6 py-20 md:py-28">
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="absolute inset-0 contour-lines" />
          <div className="relative">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {t("home.cta_kicker")}
            </p>
            <h2 className="mt-5 font-display text-5xl font-black uppercase leading-none tracking-tight text-text-primary md:text-7xl">
              {t("home.cta_title")}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-text-secondary">
              {t("home.cta_desc")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/katalog"
                className="block bg-ember px-7 py-3 font-display text-sm font-bold uppercase tracking-widest text-paper transition hover:bg-ember-light"
              >
                {t("home.cta_katalog")}
              </Link>
              <Link
                href="/daftar"
                className="block border-2 border-accent px-7 py-3 font-display text-sm font-bold uppercase tracking-widest text-accent transition hover:bg-accent/10"
              >
                {t("home.cta_daftar")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BACK TO TOP ── */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={spring}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center bg-accent text-paper shadow-lg hover:bg-accent/90 active:scale-95"
          aria-label={t("common.back_to_top")}
        >
          <ArrowUpFromLine size={18} />
        </motion.button>
      )}
    </PageShell>
  );
}