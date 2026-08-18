"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Loader2, UserX } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { revokeAllSessions } from "@/actions/profile";

export function ActiveSessions() {
  const { t } = useLanguage();
  const [revokingAll, setRevokingAll] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    setMessage(null);
    const res = await revokeAllSessions();
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: t("profile.all_sessions_revoked") });
    }
    setRevokingAll(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-moss/10 text-moss-light" : "bg-red-500/10 text-red-500"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="flex items-center gap-4 rounded-xl border border-surface-border bg-bg-elevated/50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Monitor size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary">{t("profile.active_sessions_desc")}</p>
          <p className="mt-0.5 text-sm text-text-secondary">{t("profile.current_session")}</p>
        </div>
        <button
          onClick={handleRevokeAll}
          disabled={revokingAll}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          {revokingAll ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
          <span>{t("profile.revoke_all")}</span>
        </button>
      </div>
    </motion.div>
  );
}