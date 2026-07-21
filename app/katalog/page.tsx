import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { equipmentList, locations, categories } from "../lib/data";
import CatalogClient from "./CatalogClient";
import PageShell from "../components/PageShell";

export default function KatalogPage() {
  return (
    <PageShell>
      <section className="px-6 py-14 pb-28 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <p className="font-mono text-xs tracking-[0.2em] text-accent">
            KATALOG
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">
            Cek stok, lokasi, dan harga
          </h1>
          <p className="mt-3 max-w-lg text-text-secondary">
            Data alat dari mitra penyedia di Malang Raya. Filter berdasarkan
            lokasi pengambilan atau jenis alat yang kamu butuhin.
          </p>

          <div className="mt-10">
            <CatalogClient
              items={equipmentList}
              locations={locations}
              categories={categories}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
