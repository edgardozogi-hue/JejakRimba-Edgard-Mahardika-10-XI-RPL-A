"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, Lock, Eye, EyeOff, Store, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { switchToRenter, switchToVendor } from "@/actions/profile";

type Mode = "to-renter" | "to-vendor";

export function RenterSwitchModal({
  open,
  onClose,
  onSuccess,
  mode = "to-renter",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: Mode;
  onSubmit?: (password: string) => Promise<string | null>;
}) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isToVendor = mode === "to-vendor";

  const handleSubmit = async () => {
    if (!password) {
      setError(t("settings.switch_password"));
      return;
    }
    setSubmitting(true);
    setError(null);

    if (onSubmit) {
      const submitError = await onSubmit(password);
      if (submitError) {
        setSubmitting(false);
        setError(submitError);
        return;
      }
      setSubmitting(false);
      setPassword("");
      onSuccess?.();
      return;
    }

    let res;
    if (isToVendor) {
      res = await switchToVendor(password);
    } else {
      res = await switchToRenter(password);
    }

    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setPassword("");
      onSuccess?.();
    }
  };

  const titleKey = isToVendor ? "settings.switch_vendor_modal_title" : "settings.switch_modal_title";
  const descKey = isToVendor ? "settings.switch_vendor_modal_desc" : "settings.switch_modal_desc";
  const buttonKey = isToVendor ? "settings.switch_to_vendor" : "settings.switch_to_renter";
  const icon = isToVendor ? <Store size={24} className="text-accent" /> : <UserRound size={24} className="text-accent" />;
  const buttonIcon = isToVendor ? <Store size={16} /> : <ShieldCheck size={16} />;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bark/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!submitting) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-accent/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                {icon}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  {t(titleKey)}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {t(descKey)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.switch_password")}
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                    required
                    className="w-full rounded-xl border border-surface-border bg-bg px-11 py-2.5 pl-10 pr-10 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface hover:text-text-primary"
                    aria-label={show ? "hidden" : "show"}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-elevated disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !password}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    buttonIcon
                  )}
                  <span>
                    {submitting ? t("common.saving") : t(buttonKey)}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}