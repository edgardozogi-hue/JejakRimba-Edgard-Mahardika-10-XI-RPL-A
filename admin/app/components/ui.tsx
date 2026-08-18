"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// ── Page header ──

export function AdminPageHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
        {kicker}
      </p>
      <h1 className="mt-1 font-display text-2xl font-black uppercase leading-[0.95] tracking-tight text-text-primary md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-text-secondary">{subtitle}</p>}
    </div>
  );
}

// ── Stat card ──

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  prefix,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  accent?: boolean;
  prefix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-surface-border bg-surface p-4"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          accent ? "bg-accent/15" : "bg-bg-elevated"
        }`}
      >
        <Icon size={17} className={accent ? "text-accent" : "text-text-secondary"} />
      </div>
      <p className="mt-3 font-display text-2xl font-black text-text-primary">
        {prefix ? `${prefix} ` : ""}
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </motion.div>
  );
}

// ── Status & active pills ──

export function ActivePill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
      }`}
    >
      {active ? "Aktif" : "Non-aktif"}
    </span>
  );
}

// ── Search input ──

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-surface-border bg-surface py-2.5 pl-3 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/30 sm:w-72"
    />
  );
}

// ── Table wrapper ──

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-surface-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-surface-border">{children}</tr>
    </thead>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
      {children}
    </th>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-surface-border transition last:border-0 hover:bg-bg-elevated/50">
      {children}
    </tr>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-text-primary ${className}`}>{children}</td>;
}

// ── Empty state ──

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border p-14 text-center">
      <p className="font-display text-lg font-bold text-text-primary">{message}</p>
    </div>
  );
}

// ── Confirm dialog ──

export function ConfirmDialog({
  open,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-surface-border bg-bg p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-text-primary">{confirmLabel}</h3>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-surface-border bg-surface py-2.5 text-sm font-semibold text-text-secondary transition hover:text-text-primary disabled:opacity-50"
          >
            {t("common.batal")}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}