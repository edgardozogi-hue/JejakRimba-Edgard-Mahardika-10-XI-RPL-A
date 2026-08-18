"use client";

import { useLanguage } from "../lib/i18n";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-surface-border">
        <span className="font-archivo text-xs text-text-secondary">JR</span>
      </div>
      <p className="font-archivo text-xs uppercase tracking-widest text-accent">
        {t("comingsoon.badge")}
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-text-primary">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>
      )}
    </div>
  );
}
