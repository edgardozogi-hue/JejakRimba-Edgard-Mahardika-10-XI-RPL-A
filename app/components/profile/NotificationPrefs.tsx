"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Tag } from "lucide-react";
import { Switch } from "./Switch";
import { useLanguage } from "@/lib/i18n";
import { updateNotificationPrefs, type NotificationPrefs } from "@/actions/profile";

export function NotificationPrefs() {
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    booking: true,
    reminder: true,
    promo: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = async (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    setMessage(null);

    const res = await updateNotificationPrefs(next);
    setSaving(false);
    
    if (res.error) {
      setPrefs(prefs); // revert
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: t("common.saved") });
    }
  };

  const items = [
    {
      key: "booking" as keyof NotificationPrefs,
      icon: Bell,
      labelKey: "profile.booking_notif",
      descKey: "profile.booking_notif_desc",
    },
    {
      key: "reminder" as keyof NotificationPrefs,
      icon: Calendar,
      labelKey: "profile.reminder_notif",
      descKey: "profile.reminder_notif_desc",
    },
    {
      key: "promo" as keyof NotificationPrefs,
      icon: Tag,
      labelKey: "profile.promo_notif",
      descKey: "profile.promo_notif_desc",
    },
  ];

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
            message.type === "success"
              ? "bg-moss/10 text-moss-light"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center gap-4 rounded-xl border border-surface-border bg-bg-elevated/50 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <item.icon size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">{t(item.labelKey)}</p>
              <p className="mt-0.5 text-sm text-text-secondary">{t(item.descKey)}</p>
            </div>
            <Switch
              label=""
              checked={prefs[item.key]}
              onChange={(v) => handleChange(item.key, v)}
              disabled={saving}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}