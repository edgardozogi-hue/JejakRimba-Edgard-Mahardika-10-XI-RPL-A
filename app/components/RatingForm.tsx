"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, Loader, LogIn } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "../actions/auth";
import { createReview, getEquipmentReviews } from "../actions/review";
import type { ReviewItem } from "../actions/review";
import { fadeUp } from "../lib/animations";

export default function RatingForm({ equipmentId }: { equipmentId: string }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res.user) setUser({ id: res.user.id, email: res.user.email });
      setAuthLoading(false);
    });
    getEquipmentReviews(equipmentId).then((data) => {
      setReviews(data);
      setReviewsLoading(false);
    });
  }, [equipmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || !komentar.trim()) return;
    setSubmitError(null);
    setSubmitting(true);

    // Server action expects booking_id — for general reviews we pass empty
    const result = await createReview({
      booking_id: "",
      equipment_id: equipmentId,
      rating,
      comment: komentar.trim(),
    });

    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    setRating(0);
    setKomentar("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);

    // Refresh reviews
    getEquipmentReviews(equipmentId).then(setReviews);
  }

  return (
    <section className="mt-8 w-full py-10 lg:py-12">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6">
        {/* ── FORM: full width ── */}
        <div className="w-full">
          <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 lg:p-7">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Beri Rating & Testimoni
        </h3>
        <p className="mt-1 font-display text-sm text-text-secondary">
          Bagikan pengalamanmu setelah menyewa alat ini
        </p>

        {authLoading ? (
          <div className="mt-5 flex items-center justify-center py-8">
            <Loader size={20} className="animate-spin text-text-secondary" />
          </div>
        ) : !user ? (
          <div className="mt-5 rounded-xl bg-bg-elevated p-6 text-center">
            <LogIn size={24} className="mx-auto text-text-secondary" />
            <p className="mt-2 font-display text-sm text-text-secondary">
              Login untuk memberikan rating dan testimoni
            </p>
            <Link href="/masuk">
              <span className="mt-3 inline-flex rounded-xl bg-accent px-5 py-2.5 font-display text-sm font-semibold text-paper transition hover:bg-accent-hover">
                Login / Daftar
              </span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
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
                      fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                      strokeWidth={star <= (hoverRating || rating) ? 0 : 1.5}
                      className={star <= (hoverRating || rating) ? "text-amber-400" : "text-text-secondary/40"}
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

            {submitError && (
              <div className="flex items-start gap-2 rounded-xl bg-red/10 px-4 py-3 text-sm text-red">
                <span>{submitError}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 py-3 font-display text-sm font-bold text-paper shadow-sm transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                "Kirim Rating"
              )}
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
        )}
          </div>
        </div>

        {/* ── REVIEWS: below the form, full width ── */}
        <div className="w-full">
          <h3 className="font-display text-lg font-semibold text-text-primary">
            Ulasan Penyewa
          </h3>
          <p className="mt-1 font-display text-sm text-text-secondary">
            Pengalaman nyata dari para penyewa alat ini
          </p>
          {reviewsLoading ? (
            <div className="mt-6 flex items-center justify-center py-10">
              <Loader size={20} className="animate-spin text-text-secondary" />
            </div>
          ) : reviews.length > 0 ? (
            <div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      {(review.reviewer?.full_name ?? "??").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-text-primary">
                        {review.reviewer?.full_name ?? "Pengguna"}
                      </p>
                      <p className="font-display text-xs text-text-secondary">
                        {new Date(review.created_at).toLocaleDateString("id-ID", {
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
                {review.comment && (
                  <p className="mt-3 font-display text-sm leading-relaxed text-text-secondary">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
            </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-surface-border p-8 text-center">
              <p className="font-display text-sm text-text-secondary">
                Belum ada ulasan untuk alat ini. Jadilah yang pertama memberi rating!
              </p>
            </div>
          )}
          </div>
        </div>
      </section>
  );
}
