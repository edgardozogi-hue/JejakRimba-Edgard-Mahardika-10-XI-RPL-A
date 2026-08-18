"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { getEquipmentList, getCategories } from "../actions/equipment";
import type { EquipmentFrontend } from "../lib/database.types";
import CatalogClient from "./CatalogClient";
import PageShell from "../components/PageShell";

export default function KatalogPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<EquipmentFrontend[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search] = useState("");

  useEffect(() => {
    Promise.all([getEquipmentList(), getCategories()]).then(([equip, cats]) => {
      setItems(equip);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageShell>
        <section className="px-6 py-14 pb-28 md:pb-14">
          <div className="mx-auto max-w-6xl">
            <p className="font-archivo text-xs tracking-[0.2em] text-accent">
              {t("katalog.title")}
            </p>
            <div className="mt-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="px-6 py-14 pb-28 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            {t("common.back")}
          </Link>

          <p className="font-archivo text-xs tracking-[0.2em] text-accent">
            {t("katalog.title")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">
            {t("katalog.check_stock")}
          </h1>
          <p className="mt-3 max-w-lg text-text-secondary">
            {t("katalog.desc")}
          </p>

          <div className="mt-10">
            <CatalogClient
              items={items}
              categories={categories}
              initialSearch={search}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
