"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import PageShell from "../components/PageShell";
import { fadeUp, staggerContainer, spring } from "../lib/animations";
import { useLanguage } from "../lib/i18n";

const faqs = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
  { qKey: "faq.q7", aKey: "faq.a7" },
  { qKey: "faq.q8", aKey: "faq.a8" },
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
  const { t } = useLanguage();
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
                {t("faq.kicker")}
              </p>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                FAQ
              </h1>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-3 font-display text-sm text-text-secondary">
            {t("faq.desc")}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                q={t(faq.qKey)}
                a={t(faq.aKey)}
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
