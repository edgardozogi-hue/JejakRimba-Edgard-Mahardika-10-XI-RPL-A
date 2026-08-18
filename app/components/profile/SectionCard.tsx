"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

interface SectionCardProps {
  titleKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
  className?: string;
  danger?: boolean;
}

export function SectionCard({ titleKey, icon: Icon, children, className = "", danger = false }: SectionCardProps) {
  const { t } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border ${danger ? "border-red-400/30 bg-red-500/5" : "border-surface-border bg-surface"} p-5 ${className}`}
    >
      <div className="mb-5 flex items-center gap-2">
        <Icon size={20} className={danger ? "text-red-500" : "text-accent"} />
        <h2 className="font-display text-base font-bold text-text-primary">{t(titleKey)}</h2>
      </div>
      <div>{children}</div>
    </motion.section>
  );
}