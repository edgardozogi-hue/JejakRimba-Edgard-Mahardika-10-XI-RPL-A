"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { spring, fadeUp } from "../lib/animations";

export type UserReview = {
  id: string;
  name: string;
  rating: number;
  komentar: string;
  date: string;
};

function getStorageKey(equipmentId: string) {
  return `jejakrimba-reviews-${equipmentId}`;
}

export function getReviews(equipmentId: string): UserReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(equipmentId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function RatingForm({ equipmentId }: { equipmentId: string }) {
  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<UserReview[]>([]);

  useEffect(() => {
    setReviews(getReviews(equipmentId));
  }, [equipmentId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || rating === 0 || !komentar.trim()) return;

    const newReview: UserReview = {
      id: `ur-${Date.now()}`,
      name: nama.trim(),
      rating,
      komentar: komentar.trim(),
      date: new Date().toISOString(),
    };

    const existing = getReviews(equipmentId);
    existing.unshift(newReview);
    localStorage.setItem(getStorageKey(equipmentId), JSON.stringify(existing));

    setReviews(existing);
    setNama("");
    setRating(0);
    setKomentar("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* ── Form ── */}
      <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 lg:p-7">
        <h3 className="font-display text-base font-semibold text-text-primary">
          Beri Rating & Testimoni
        </h3>
        <p className="mt-1 font-display text-sm text-text-secondary">
          Bagikan pengalamanmu setelah menyewa alat ini
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Nama */}
          <div>
            <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama"
              className="w-full rounded-xl border border-surface-border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>

          {/* Rating bintang */}
          <div>
            <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="cursor-pointer transition hover:scale-110 active:scale-90"
                >
                  <Star
                    size={24}
                    fill={
                      star <= (hoverRating || rating) ? "currentColor" : "none"
                    }
                    strokeWidth={
                      star <= (hoverRating || rating) ? 0 : 1.5
                    }
                    className={`${
                      star <= (hoverRating || rating)
                        ? "text-amber-400"
                        : "text-text-secondary/40"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 font-display text-sm text-text-secondary">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Komentar */}
          <div>
            <label className="mb-1.5 block font-display text-[13px] font-semibold text-text-primary">
              Testimoni
            </label>
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              rows={3}
              placeholder="Ceritakan pengalamanmu menyewa alat ini"
              className="w-full resize-none rounded-xl border border-surface-border bg-bg px-4 py-[13px] font-display text-sm text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 py-3 font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Kirim Rating
          </motion.button>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 rounded-xl bg-moss/15 px-4 py-3 font-display text-sm text-moss"
              >
                <CheckCircle size={16} />
                Terima kasih! Testimoni kamu sudah tersimpan.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* ── Daftar Review ── */}
      {reviews.length > 0 && (
        <div>
          <h3 className="font-display text-base font-semibold text-text-primary">
            Testimoni Pengguna ({reviews.length})
          </h3>
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-display text-sm font-bold text-accent">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-text-primary">
                        {review.name}
                      </p>
                      <p className="font-display text-xs text-text-secondary">
                        {new Date(review.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < review.rating ? "currentColor" : "none"}
                        strokeWidth={i < review.rating ? 0 : 1.5}
                        className={i < review.rating ? "text-amber-400" : "text-text-secondary/40"}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 font-display text-sm leading-relaxed text-text-secondary">
                  &ldquo;{review.komentar}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
