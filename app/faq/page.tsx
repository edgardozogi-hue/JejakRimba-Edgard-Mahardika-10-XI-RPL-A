"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import PageShell from "../components/PageShell";
import { fadeUp, staggerContainer, spring } from "../lib/animations";

const faqs = [
  {
    q: "Bagaimana cara menyewa alat?",
    a: "Pilih alat yang diinginkan melalui halaman Katalog, lalu klik Sewa Sekarang. Isi tanggal sewa dan data diri, kemudian konfirmasi pemesanan. Setelah itu, kamu bisa mengambil alat di lokasi mitra penyedia.",
  },
  {
    q: "Di mana lokasi pengambilan alat?",
    a: "Lokasi pengambilan tergantung mitra penyedia yang dipilih. Tersedia di beberapa titik di Malang Raya: Malang Kota, Batu, dan Lawang. Detail alamat akan diberikan setelah pemesanan dikonfirmasi.",
  },
  {
    q: "Apa yang terjadi jika alat rusak?",
    a: "Kerusakan akibat pemakaian normal sudah diperhitungkan. Namun, kerusakan akibat kelalaian pengguna (jatuh, terbakar, hilang) akan dikenakan biaya ganti rugi sesuai kesepakatan.",
  },
  {
    q: "Bolehkah memperpanjang masa sewa?",
    a: "Bisa. Hubungi mitra penyedia melalui kontak yang diberikan minimal H-1 sebelum masa sewa berakhir. Perpanjangan tergantung ketersediaan alat.",
  },
  {
    q: "Bagaimana jika saya telat mengembalikan?",
    a: "Denda keterlambatan dikenakan sebesar 50% dari harga sewa per hari. Mohon kembalikan alat tepat waktu agar tidak mengganggu penyewa lain.",
  },
  {
    q: "Apakah ada minimal durasi sewa?",
    a: "Minimal durasi sewa adalah 1 hari. Untuk durasi lebih dari 7 hari, kamu bisa menghubungi mitra untuk mendapatkan harga khusus.",
  },
  {
    q: "Bagaimana cara membatalkan pesanan?",
    a: "Pembatalan bisa dilakukan melalui halaman Booking atau menghubungi admin. Pembatalan H-1 mendapatkan refund 80%. Pembatalan di hari H tidak mendapat refund.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Ya. Data pribadi kamu dilindungi dan tidak akan dibagikan ke pihak ketiga tanpa izin. Detail lebih lanjut bisa dilihat di halaman Kebijakan Privasi.",
  },
];

function AccordionItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <button
        onClick={onClick}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-bg-elevated/50 lg:px-7"
      >
        <span className="font-display text-sm font-semibold text-text-primary">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={spring}
        >
          <ChevronDown size={16} className="shrink-0 text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-surface-border px-5 py-4 lg:px-7">
              <p className="font-display text-sm leading-relaxed text-text-secondary">
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
              <HelpCircle size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
                TANYA JAWAB
              </p>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                FAQ
              </h1>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-3 font-display text-sm text-text-secondary">
            Pertanyaan yang sering diajukan tentang layanan Jejak Rimba
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </PageShell>
  );
}
