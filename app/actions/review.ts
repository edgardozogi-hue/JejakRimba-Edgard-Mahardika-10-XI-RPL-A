"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "../lib/supabase-server";

type ReviewerRef = { full_name: string; avatar_url: string | null } | null;

type ReviewsRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: ReviewerRef;
};

type UserReviewsRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  equipment: { name: string }[];
};

type TestimonialRow = {
  id: string;
  rating: number;
  comment: string;
  reviewer: { full_name: string; avatar_url: string | null } | null;
};

// ── Create Review ──

export type CreateReviewResult = {
  error: string | null;
  reviewId: string | null;
};

export async function createReview(formData: {
  booking_id?: string;
  equipment_id: string;
  rating: number;
  comment?: string;
}): Promise<CreateReviewResult> {
  const supabase = await getServerClient();

  // 1. Cek auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Kamu harus login untuk memberikan ulasan.", reviewId: null };
  }

  // 2. Validasi rating
  if (formData.rating < 1 || formData.rating > 5) {
    return { error: "Rating harus antara 1-5.", reviewId: null };
  }

  // 3. Jika booking_id diberikan, validasi booking
  if (formData.booking_id && formData.booking_id.length > 0) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("renter_id, status")
      .eq("id", formData.booking_id)
      .single();

    if (!booking) {
      return { error: "Booking tidak ditemukan.", reviewId: null };
    }

    if (booking.renter_id !== user.id) {
      return {
        error: "Kamu hanya bisa mereview booking milikmu sendiri.",
        reviewId: null,
      };
    }

    if (booking.status !== "selesai") {
      return {
        error: "Ulasan hanya bisa diberikan setelah penyewaan selesai.",
        reviewId: null,
      };
    }

    // Cek apakah sudah pernah review untuk booking ini
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", formData.booking_id)
      .single();

    if (existingReview) {
      return {
        error: "Kamu sudah memberikan ulasan untuk booking ini.",
        reviewId: null,
      };
    }
  }

  // 4. Cek apakah sudah pernah review equipment ini oleh user yang sama (general review)
  if (!formData.booking_id || formData.booking_id.length === 0) {
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("equipment_id", formData.equipment_id)
      .eq("reviewer_id", user.id)
      .is("booking_id", null)
      .single();

    if (existingReview) {
      return {
        error: "Kamu sudah memberikan ulasan untuk alat ini.",
        reviewId: null,
      };
    }
  }

  // 5. Insert review
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      booking_id: formData.booking_id || null,
      reviewer_id: user.id,
      equipment_id: formData.equipment_id,
      rating: formData.rating,
      comment: formData.comment ?? null,
    })
    .select("id")
    .single();

  if (reviewError) {
    return {
      error: "Gagal menyimpan ulasan: " + reviewError.message,
      reviewId: null,
    };
  }

  revalidatePath(`/katalog/${formData.equipment_id}`);
  revalidatePath("/profil");

  return { error: null, reviewId: review.id };
}

// ── Get Reviews for Equipment ──

export type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url: string | null;
  } | null;
};

export async function getEquipmentReviews(
  equipmentId: string
): Promise<ReviewItem[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviewer_id(full_name, avatar_url)
    `)
    .eq("equipment_id", equipmentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getEquipmentReviews error:", error?.message);
    return [];
  }

  return ((data ?? []) as unknown as ReviewsRow[]).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer: r.reviewer,
  }));
}

// ── Get User's Reviews ──

export async function getUserReviews(): Promise<ReviewItem[]> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      equipment:equipment!equipment_id(name, category)
    `)
    .eq("reviewer_id", user.id)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return ((data ?? []) as unknown as UserReviewsRow[]).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    equipment_name: r.equipment?.[0]?.name ?? "Unknown",
  })) as unknown as ReviewItem[];
}

// ── Get Testimonials (untuk landing page) ──

export type TestimonialFrontend = {
  id: string;
  name: string;
  asal: string;
  rating: number;
  komentar: string;
  avatar: string;
  avatar_url: string | null;
};

export async function getTestimonials(): Promise<TestimonialFrontend[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviewer_id(full_name, avatar_url)
    `)
    .not("comment", "is", null)
    .not("comment", "eq", "")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) {
    console.error("getTestimonials error:", error?.message);
    return [];
  }

  return ((data ?? []) as unknown as TestimonialRow[])
    .filter((r) => r.comment)
    .map((r) => ({
      id: r.id,
      name: r.reviewer?.full_name ?? "Pengguna",
      asal: "Malang Raya",
      rating: r.rating,
      komentar: r.comment ?? "",
      avatar: (r.reviewer?.full_name ?? "??")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      avatar_url: r.reviewer?.avatar_url ?? null,
    }));
}
