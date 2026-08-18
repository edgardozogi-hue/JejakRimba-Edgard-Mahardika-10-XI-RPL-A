"use client";

import { useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

interface SwitchProps {
  label?: string;
  labelKey?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

const COLORS = {
  off: "rgba(26, 23, 20, 0.08)",
  on: "#c4622d",
} as const;

export function Switch({ label, labelKey, defaultChecked = false, checked, onChange, disabled, description }: SwitchProps) {
  const { t } = useLanguage();
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const currentChecked = isControlled ? checked : internalChecked;
  const x = useMotionValue(currentChecked ? 22 : 2);

  const handleClick = () => {
    if (disabled) return;
    const next = !currentChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <label className="flex items-center justify-between cursor-pointer" htmlFor={`switch-${labelKey || label || "toggle"}`}>
      <div>
        <span className="text-sm text-text-primary">{labelKey ? t(labelKey) : label}</span>
        {description && <p className="mt-0.5 text-[11px] text-text-secondary">{description}</p>}
      </div>
      <button
        id={`switch-${labelKey || label || "toggle"}`}
        type="button"
        role="switch"
        aria-checked={currentChecked}
        aria-disabled={disabled}
        onClick={handleClick}
        disabled={disabled}
        className="relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: currentChecked ? COLORS.on : COLORS.off }}
      >
        <motion.span
          style={{ x }}
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-paper shadow-md"
          animate={{ x: currentChecked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </button>
    </label>
  );
}