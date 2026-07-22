"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";
import { fadeUp, staggerContainer } from "../lib/animations";

const sections = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    content:
      "Kami mengumpulkan informasi yang Anda berikan saat mendaftar atau melakukan pemesanan, seperti nama, nomor telepon, dan alamat email. Kami juga mengumpulkan data penggunaan platform untuk meningkatkan kualitas layanan.",
  },
  {
    title: "2. Penggunaan Informasi",
    content:
      "Informasi Anda digunakan untuk memproses pemesanan, menghubungkan Anda dengan mitra penyedia, memberikan notifikasi terkait status sewa, serta meningkatkan pengalaman pengguna di platform Jejak Rimba.",
  },
  {
    title: "3. Perlindungan Data",
    content:
      "Kami menjaga keamanan data pribadi Anda dengan enkripsi dan sistem keamanan standar. Data tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.",
  },
  {
    title: "4. Cookie",
    content:
      "Platform kami menggunakan cookie untuk menyimpan preferensi pengguna dan menganalisis lalu lintas website. Anda dapat menonaktifkan cookie melalui pengaturan browser kapan saja.",
  },
  {
    title: "5. Hak Pengguna",
    content:
      "Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja. Jika ada pertanyaan terkait kebijakan privasi, silakan hubungi tim Jejak Rimba melalui kontak yang tersedia.",
  },
  {
    title: "6. Perubahan Kebijakan",
    content:
      "Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui platform dan berlaku sejak tanggal publikasi.",
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
                DOKUMEN
              </p>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                Kebijakan Privasi
              </h1>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 font-display text-sm leading-relaxed text-text-secondary">
            Terakhir diperbarui: Juli 2026
          </motion.p>

          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <motion.div key={s.title} variants={fadeUp}>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  {s.title}
                </h2>
                <p className="mt-2 font-display text-sm leading-relaxed text-text-secondary">
                  {s.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
