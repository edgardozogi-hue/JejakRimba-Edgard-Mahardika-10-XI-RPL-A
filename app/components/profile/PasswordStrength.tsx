"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useLanguage();

  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: "", color: "transparent" };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { level: 1, label: t("profile.password_strength_weak"), color: "#ef4444" };
    if (score === 2) return { level: 2, label: t("profile.password_strength_fair"), color: "#f97316" };
    if (score === 3) return { level: 3, label: t("profile.password_strength_good"), color: "#eab308" };
    return { level: 4, label: t("profile.password_strength_strong"), color: "#22c55e" };
  };

  const { level, label, color } = getStrength(password);
  const width = level === 0 ? 0 : (level / 4) * 100;

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full rounded-full bg-surface-border overflow-hidden">
        <motion.div
          animate={{ width: `${width}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full rounded-full transition-colors"
          style={{ backgroundColor: level > 0 ? color : "transparent", width: width === 0 ? 0 : undefined }}
        />
      </div>
      <p className="text-xs font-medium" style={{ color: level > 0 ? color : "inherit" }}>
        {label}
      </p>
      {password && level < 4 && (
        <p className="text-[10px] text-text-secondary">
          {t("profile.password_tips")}
        </p>
      )}
    </div>
  );
}