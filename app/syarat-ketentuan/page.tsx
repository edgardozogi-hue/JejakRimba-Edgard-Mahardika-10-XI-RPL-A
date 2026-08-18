"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import PageShell from "../components/PageShell";
import { fadeUp, staggerContainer } from "../lib/animations";
import { useLanguage } from "../lib/i18n";

const sections = [
  { titleKey: "syarat.s1t", contentKey: "syarat.s1c" },
  { titleKey: "syarat.s2t", contentKey: "syarat.s2c" },
  { titleKey: "syarat.s3t", contentKey: "syarat.s3c" },
  { titleKey: "syarat.s4t", contentKey: "syarat.s4c" },
  { titleKey: "syarat.s5t", contentKey: "syarat.s5c" },
  { titleKey: "syarat.s6t", contentKey: "syarat.s6c" },
];

export default function SyaratKetentuanPage() {
  const { t } = useLanguage();
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
                {t("syarat.kicker")}
              </p>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                {t("syarat.title")}
              </h1>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 font-display text-sm leading-relaxed text-text-secondary">
            {t("syarat.updated")}
          </motion.p>

          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <motion.div key={s.titleKey} variants={fadeUp}>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  {t(s.titleKey)}
                </h2>
                <p className="mt-2 font-display text-sm leading-relaxed text-text-secondary">
                  {t(s.contentKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
