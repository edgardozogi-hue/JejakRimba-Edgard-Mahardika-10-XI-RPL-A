"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import PageShell from "../components/PageShell";
import { fadeUp, staggerContainer } from "../lib/animations";

const sections = [
  {
    title: "1. Ketentuan Umum",
    content:
      "Dengan menyewa alat melalui Jejak Rimba, pengguna menyetujui seluruh syarat dan ketentuan yang berlaku. Jejak Rimba adalah platform perantara yang mempertemukan penyewa dengan mitra penyedia alat camping dan pendakian di Malang Raya.",
  },
  {
    title: "2. Pemesanan",
    content:
      "Pemesanan alat wajib dilakukan melalui platform Jejak Rimba. Pengguna harus mengisi data diri dengan benar dan lengkap. Pemesanan dianggap sah setelah mendapatkan konfirmasi dari sistem.",
  },
  {
    title: "3. Pembayaran",
    content:
      "Pembayaran dilakukan di muka sesuai total biaya sewa yang tertera. Harga sewa sudah termasuk biaya pemakaian alat untuk durasi yang dipilih. Denda keterlambatan pengembalian dikenakan sebesar 50% dari harga sewa per hari.",
  },
  {
    title: "4. Pengambilan & Pengembalian",
    content:
      "Alat diambil dan dikembalikan di lokasi mitra penyedia yang tertera. Pengguna wajib memeriksa kondisi alat saat pengambilan. Kerusakan akibat kelalaian pengguna menjadi tanggung jawab penyewa.",
  },
  {
    title: "5. Pembatalan",
    content:
      "Pembatalan pemesanan dapat dilakukan maksimal H-1 sebelum jadwal pengambilan. Dana yang sudah dibayarkan akan dikembalikan sebesar 80% (potongan biaya admin 20%). Pembatalan di hari yang sama tidak mendapatkan pengembalian dana.",
  },
  {
    title: "6. Tanggung Jawab",
    content:
      "Jejak Rimba tidak bertanggung jawab atas kecelakaan, cedera, atau kerugian yang terjadi selama penggunaan alat. Pengguna bertanggung jawab penuh atas keselamatan diri dan kelompok selama kegiatan outdoor.",
  },
];

export default function SyaratKetentuanPage() {
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
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
                DOKUMEN
              </p>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                Syarat & Ketentuan
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
