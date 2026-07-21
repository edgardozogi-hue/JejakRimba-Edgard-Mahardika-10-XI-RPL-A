"use client";

import Link from "next/link";
import {
  ArrowRight,
  Tent,
  Backpack,
  Mountain,
  Flag,
  Search,
  CheckSquare,
  CalendarCheck,
  Package,
  ArrowUpFromLine,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { equipmentList, locations } from "./lib/data";
import PageShell from "./components/PageShell";
import MagneticButton from "./components/MagneticButton";
import {
  fadeUp,
  staggerContainer,
  staggerSlow,
  scaleIn,
  blurReveal,
  spring,
  springSnappy,
} from "./lib/animations";

const journeyStops = [
  {
    elevation: "0800",
    label: "Basecamp",
    desc: "Tenda, matras, dan perlengkapan dasar buat mendirikan camp pertama.",
    icon: Tent,
  },
  {
    elevation: "1600",
    label: "Pos Bayangan",
    desc: "Sleeping bag dan carrier buat perjalanan yang lebih jauh.",
    icon: Backpack,
  },
  {
    elevation: "2400",
    label: "Jalur Tanjakan",
    desc: "Jaket gunung dan alat masak buat cuaca yang mulai berubah.",
    icon: Mountain,
  },
  {
    elevation: "2700+",
    label: "Menuju Puncak",
    desc: "Perlengkapan kapasitas besar buat tim pendakian rombongan.",
    icon: Flag,
  },
];

const howItWorksSteps = [
  {
    icon: Search,
    title: "Cari Alat",
    desc: "Jelajahi katalog perlengkapan camping dari berbagai penyewa di sekitar Malang Raya.",
  },
  {
    icon: CheckSquare,
    title: "Pilih & Bandingkan",
    desc: "Bandingkan harga, lokasi, dan ketersediaan stok real-time sebelum memutuskan.",
  },
  {
    icon: CalendarCheck,
    title: "Booking",
    desc: "Tentukan tanggal sewa dan lakukan pemesanan langsung lewat platform.",
  },
  {
    icon: Package,
    title: "Ambil di Lokasi",
    desc: "Datang ke titik pengambilan yang sudah ditentukan dan mulai petualanganmu.",
  },
];

const partners = ["Rimba Gear Malang", "Alas Camp Batu", "Basecamp Lawang"];

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
    <div ref={ref}>
      <p className="font-mono text-2xl font-bold text-moss-light">{count}</p>
      <p className="font-mono text-xs text-paper-dim/70">{label}</p>
    </div>
  );
}

export default function Home() {
  const totalStock = equipmentList.reduce((sum, e) => sum + e.stock, 0);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-paper">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bark via-bark/70 to-bark/30" />
        <motion.div
          className="relative z-10 mx-auto max-w-6xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs tracking-[0.2em] text-ember-light"
          >
            MALANG RAYA · BATU · LAWANG
          </motion.p>

          <motion.h1
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl"
          >
            {["Alat", "mendaki", "tersedia,"].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="inline-block mr-[0.3em]"
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
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.3,
                  },
                },
              }}
              className="inline-block text-moss-light"
            >
              tanpa perlu beli.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg text-paper-dim"
          >
            Jejak Rimba menghubungkan kamu dengan penyedia sewa alat camping
            di sekitar Malang. Lihat stok real time, lokasi pengambilan, dan
            harga per hari, sebelum berangkat naik gunung.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MagneticButton>
              <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy}>
                <Link
                  href="/katalog"
                  className="block rounded-xl bg-ember px-7 py-3 font-semibold text-paper transition hover:bg-ember-light"
                >
                  Lihat Katalog Alat
                </Link>
              </motion.div>
            </MagneticButton>
            <MagneticButton>
              <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy}>
                <a
                  href="#alur"
                  className="block rounded-xl border border-paper/30 px-7 py-3 font-semibold text-paper transition hover:border-paper/60"
                >
                  Gimana Cara Sewanya?
                </a>
              </motion.div>
            </MagneticButton>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-16 grid max-w-md grid-cols-3 gap-6 font-mono text-sm"
          >
            <Counter value={totalStock} label="unit tersedia" />
            <Counter value={locations.length} label="titik lokasi" />
            <Counter value={3} label="mitra penyedia" />
          </motion.div>
        </motion.div>
      </section>

      {/* Journey */}
      <motion.section
        id="alur"
        className="px-6 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerSlow}
      >
        <div className="mx-auto max-w-6xl">
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs tracking-[0.2em] text-accent"
          >
            RUTE PERSIAPAN
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 max-w-lg font-display text-3xl font-bold text-text-primary"
          >
            Alat yang kamu butuhin, mengikuti jalur pendakian
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="mt-14 grid gap-10 md:grid-cols-4"
          >
            {journeyStops.map((stop) => {
              const Icon = stop.icon;
              return (
                <motion.div
                  key={stop.elevation}
                  variants={blurReveal}
                  whileHover={{ y: -8, transition: spring }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-border bg-surface">
                    <Icon size={28} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-text-secondary">
                      {stop.elevation} MDPL
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-text-primary">
                      {stop.label}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {stop.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        id="cara-kerja"
        className="px-6 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerSlow}
      >
        <div className="mx-auto max-w-6xl">
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs tracking-[0.2em] text-accent"
          >
            CARA KERJA
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 max-w-lg font-display text-3xl font-bold text-text-primary"
          >
            Sewa alat camping dalam 4 langkah mudah
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="mt-14 grid gap-6 md:grid-cols-4"
          >
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={blurReveal}
                  whileHover={{ y: -6, transition: spring }}
                  className="flex flex-col items-center text-center rounded-2xl border border-surface-border bg-surface p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
                    <Icon size={26} className="text-accent" />
                  </div>
                  <p className="font-mono text-xs text-text-secondary mb-1">
                    LANGKAH {i + 1}
                  </p>
                  <p className="font-display text-lg font-bold text-text-primary">
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Partner Badges */}
      <section className="border-y border-surface-border bg-bg-elevated px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-xs tracking-[0.2em] text-text-secondary text-center mb-6"
          >
            DIPERCAYA OLEH
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {partners.map((name) => (
              <motion.div
                key={name}
                variants={scaleIn}
                className="rounded-full border border-surface-border bg-surface px-5 py-2.5 font-mono text-sm text-text-primary"
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured catalog preview */}
      <motion.section
        id="lokasi"
        className="bg-bark-2 px-6 py-24 text-paper"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerSlow}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            className="flex items-end justify-between"
          >
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-ember-light">
                STOK HARI INI
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">
                Alat yang lagi tersedia
              </h2>
            </div>
            <Link
              href="/katalog"
              className="hidden items-center gap-1.5 text-sm font-semibold text-moss-light hover:underline md:inline-flex"
            >
              Lihat semua <ArrowRight size={14} />
            </Link>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            className="mt-12 grid gap-5 md:grid-cols-3"
          >
            {equipmentList.slice(0, 6).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/katalog/${item.id}`}
                  className="block rounded-2xl border border-paper/10 bg-paper/[0.04] p-6"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-display font-bold">{item.name}</p>
                    <span
                      className={`shrink-0 rounded-xl px-2 py-0.5 font-mono text-[11px] ${
                        item.stock > 0
                          ? "bg-moss/30 text-moss-light"
                          : "bg-ember/20 text-ember-light"
                      }`}
                    >
                      {item.stock > 0 ? `${item.stock} unit` : "Habis"}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-stone">
                    {item.location} · {item.provider}
                  </p>
                  <p className="mt-4 font-mono text-lg text-ember-light">
                    Rp{item.pricePerDay.toLocaleString("id-ID")}
                    <span className="text-xs text-stone"> /hari</span>
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-10 inline-flex w-full items-center justify-center gap-1.5 text-center text-sm font-semibold text-moss-light hover:underline md:hidden"
          >
            <Link href="/katalog" className="inline-flex items-center gap-1.5">
              Lihat semua alat <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <section className="bg-bg-elevated border-t border-surface-border px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerSlow}
          >
            <motion.p
              variants={fadeUp}
              className="font-mono text-xs tracking-[0.2em] text-accent"
            >
              MULAI PETUALANGAN
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-display text-4xl font-bold text-text-primary"
            >
              Siap mendaki?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-md text-text-secondary"
            >
              Daftar sekarang dan temukan perlengkapan camping terbaik untuk
              perjalananmu. Ribuan alat siap pakai tanpa perlu beli.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <MagneticButton>
                <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy}>
                  <Link
                    href="/katalog"
                    className="block rounded-xl bg-ember px-7 py-3 font-semibold text-paper transition hover:bg-ember-light"
                  >
                    Lihat Katalog
                  </Link>
                </motion.div>
              </MagneticButton>
              <MagneticButton>
                <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy}>
                  <Link
                    href="/daftar"
                    className="block rounded-xl border border-accent px-7 py-3 font-semibold text-accent transition hover:bg-accent/10"
                  >
                    Daftar Sekarang
                  </Link>
                </motion.div>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="px-6 py-10 pb-28 text-center font-mono text-xs text-text-secondary md:pb-10"
      >
        Jejak Rimba — dibuat buat proyek ujian, bukan platform komersial aktif.
        <br />
        <span className="text-accent">Edgard Mahardika / 10 XI RPL A</span>
      </motion.footer>

      {/* Back to Top */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={spring}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-paper shadow-lg hover:bg-accent/90 active:scale-95"
          aria-label="Kembali ke atas"
        >
          <ArrowUpFromLine size={18} />
        </motion.button>
      )}
    </PageShell>
  );
}


