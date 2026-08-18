"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, UserX, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { softDeleteAccount, revokeAllSessions } from "@/actions/profile";

export function DangerZone() {
  const { t } = useLanguage();
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDeleteAccount = async () => {
    const userEmail = deleteEmail.trim();
    if (!userEmail) {
      setMessage({ type: "error", text: t("profile.delete_confirm") });
      return;
    }

    setDeleting(true);
    setMessage(null);

    const res = await softDeleteAccount(userEmail);
    setDeleting(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: t("profile.deleted_success") });
      setShowDeleteModal(false);
      setDeleteEmail("");
      // Redirect will happen via auth state change
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    setMessage(null);

    const res = await revokeAllSessions();
    setRevokingAll(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: t("profile.all_sessions_revoked") });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-moss/10 text-moss-light"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Revoke All Sessions */}
      <div className="rounded-xl border border-red-400/30 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <UserX size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-red-500">{t("profile.revoke_all_sessions")}</h4>
            <p className="mt-1 text-sm text-red-500/80">{t("profile.revoke_all_sessions_desc")}</p>
            <button
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="mt-3 flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {revokingAll ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
              <span>{revokingAll ? t("common.saving") : t("profile.revoke_all")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="rounded-xl border-2 border-red-400/50 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-red-500">{t("profile.delete_account")}</h4>
            <p className="mt-1 text-sm text-red-500/80">{t("profile.delete_account_desc")}</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="mt-3 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-red-600"
            >
              <Trash2 size={16} />
              <span>{t("profile.delete_account")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bark/60 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-500/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-red-500">{t("profile.delete_confirm_title")}</h3>
                  <p className="mt-1 text-sm text-red-500/80">{t("profile.delete_confirm_desc")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    {t("profile.delete_confirm")}
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    placeholder={t("profile.email_placeholder")}
                    className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-red-400/40 focus:ring-1 focus:ring-red-400/30"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-elevated disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || !deleteEmail.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    <span>{deleting ? t("common.deleting") : t("profile.delete_account")}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}