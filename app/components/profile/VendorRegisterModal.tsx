"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Building2, MapPin, Phone, MessageSquare, Lock, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { registerAsVendor } from "@/actions/profile";

export function VendorRegisterModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    whatsapp_number: "",
    address: "",
    city: "",
    lat: 0,
    lng: 0,
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (
      !formData.business_name ||
      !formData.description ||
      !formData.whatsapp_number ||
      !formData.address ||
      !formData.city ||
      !formData.lat ||
      !formData.lng
    ) {
      setError(t("settings.vendor_reg_required"));
      return;
    }
    if (!password) {
      setError(t("settings.switch_password"));
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await registerAsVendor(formData, password);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setFormData({
        business_name: "",
        description: "",
        whatsapp_number: "",
        address: "",
        city: "",
        lat: 0,
        lng: 0,
      });
      setPassword("");
      onSuccess?.();
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
            className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-accent/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Building2 size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  {t("settings.vendor_reg_title")}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {t("settings.vendor_reg_desc")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.vendor_business_name")}
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                  placeholder={t("settings.vendor_business_name_placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.vendor_description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none"
                  placeholder={t("settings.vendor_description_placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.vendor_whatsapp")}
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                  placeholder="+62 8xx xxxx xxxx"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.vendor_address")}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                  placeholder={t("settings.vendor_address_placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.vendor_city")}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                  placeholder={t("settings.vendor_city_placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("settings.vendor_location")}
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => handleChange("lat", parseFloat(e.target.value) || 0)}
                    className="rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                    placeholder={t("settings.vendor_lat")}
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => handleChange("lng", parseFloat(e.target.value) || 0)}
                    className="rounded-xl border border-surface-border bg-bg px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                    placeholder={t("settings.vendor_lng")}
                    required
                  />
                </div>
              </div>

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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                    required
                    className="w-full rounded-xl border border-surface-border bg-bg px-11 py-2.5 pl-10 pr-10 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface hover:text-text-primary"
                    aria-label={showPassword ? "hidden" : "show"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Building2 size={16} />
                  )}
                  <span>
                    {submitting ? t("common.saving") : t("settings.register_as_vendor")}
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