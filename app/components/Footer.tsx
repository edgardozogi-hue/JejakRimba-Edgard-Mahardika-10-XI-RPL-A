"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Camera, Globe, Music, ArrowUpRight } from "lucide-react";
import { spring, fadeUp, staggerContainer } from "../lib/animations";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/katalog" },
  { label: "Booking", href: "/booking" },
  { label: "Profil", href: "/profil" },
];

const bantuanLinks = [
  { label: "Cara Sewa", href: "/" },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "FAQ", href: "/faq" },
];

const socialLinks = [
  { label: "Instagram", icon: Camera, href: "#" },
  { label: "Facebook", icon: Globe, href: "#" },
  { label: "TikTok", icon: Music, href: "#" },
];

export default function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="mt-16 border-t border-surface-border bg-surface"
    >
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand column */}
          <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl font-bold tracking-tight text-text-primary">
                Jejak<span className="text-accent">Rimba</span>
              </span>
            </Link>
            <p className="mt-3 font-display text-sm leading-relaxed text-text-secondary">
              Platform sewa alat camping dan pendakian terpercaya di Malang Raya.
              Tenda, carrier, sleeping bag, kompor, dan perlengkapan outdoor lainnya.
            </p>
            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={spring}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-elevated text-text-secondary transition hover:bg-accent hover:text-paper"
                    aria-label={s.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Navigasi */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold tracking-wider text-text-primary">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-3">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1 font-display text-sm text-text-secondary transition hover:text-accent"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Bantuan */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold tracking-wider text-text-primary">
              Bantuan
            </h3>
            <ul className="mt-4 space-y-3">
              {bantuanLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1 font-display text-sm text-text-secondary transition hover:text-accent"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact column */}
          <motion.div variants={fadeUp} className="lg:col-span-4">
            <h3 className="font-display text-sm font-bold tracking-wider text-text-primary">
              Kontak
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <span className="font-display text-sm text-text-secondary">
                  Malang Raya (Malang, Batu, Lawang), Jawa Timur
                </span>
              </li>
              <li>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-display text-sm text-text-secondary transition hover:text-accent"
                >
                  <Phone size={16} className="text-accent" />
                  +62 812-3456-7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@jejakrimba.com"
                  className="group inline-flex items-center gap-2 font-display text-sm text-text-secondary transition hover:text-accent"
                >
                  <Mail size={16} className="text-accent" />
                  hello@jejakrimba.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 md:flex-row">
          <p className="font-display text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Jejak Rimba. Dibuat buat proyek ujian, bukan platform komersial aktif.
          </p>
          <p className="font-display text-xs font-semibold text-accent">
            Edgard Mahardika / 10 XI RPL A
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
