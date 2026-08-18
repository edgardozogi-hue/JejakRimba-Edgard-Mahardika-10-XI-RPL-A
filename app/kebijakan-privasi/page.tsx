"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";
import { fadeUp, staggerContainer } from "../lib/animations";
import { useLanguage } from "../lib/i18n";

const sections = [
  { titleKey: "privasi.s1t", contentKey: "privasi.s1c" },
  { titleKey: "privasi.s2t", contentKey: "privasi.s2c" },
  { titleKey: "privasi.s3t", contentKey: "privasi.s3c" },
  { titleKey: "privasi.s4t", contentKey: "privasi.s4c" },
  { titleKey: "privasi.s5t", contentKey: "privasi.s5c" },
  { titleKey: "privasi.s6t", contentKey: "privasi.s6c" },
];

export default function KebijakanPrivasiPage() {
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
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-[11px] font-bold tracking-[0.15em] text-accent">
                {t("privasi.kicker")}
              </p>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                {t("privasi.title")}
              </h1>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 font-display text-sm leading-relaxed text-text-secondary">
            {t("privasi.updated")}
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
