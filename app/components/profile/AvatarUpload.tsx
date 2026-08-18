"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Camera } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUpload: (url: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export function AvatarUpload({ currentAvatar, onUpload, onRemove }: AvatarUploadProps) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(currentAvatar ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}.${ext}`;
      const path = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      setPreview(publicUrl);
      await onUpload(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    if (onRemove) await onRemove();
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={preview ?? "empty"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {preview ? (
              <>
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-surface-border bg-surface relative">
                  <img
                    src={preview}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-paper shadow-lg hover:bg-red-600 transition disabled:opacity-50"
                  aria-label={t("profile.avatar_remove")}
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-surface-border bg-surface transition hover:border-accent/40 hover:bg-accent/5 disabled:opacity-50"
                aria-label={t("profile.avatar_upload")}
              >
                <div className="flex flex-col items-center gap-2 text-text-secondary">
                  <Upload size={24} />
                  <span className="font-mono text-[10px] uppercase tracking-wider">{t("profile.avatar_upload")}</span>
                </div>
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading || !!preview}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary transition hover:border-accent/40 hover:text-accent disabled:opacity-50"
          >
            <Camera size={18} />
            <span>{preview ? t("profile.avatar_change") : t("profile.avatar_upload")}</span>
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-4 py-2 text-sm text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <X size={18} />
              <span>{t("profile.avatar_remove")}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}