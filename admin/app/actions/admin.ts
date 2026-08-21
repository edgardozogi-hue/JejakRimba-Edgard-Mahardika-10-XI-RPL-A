"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getServiceClient } from "@/lib/supabase-server";

// ── Guard: semua action admin wajib role "admin" ──
// Pengecekan role dipakai lewat server client (session user, bisa baca profil sendiri).
// Setelah lolos, QUERY DATA memakai service role client (bypass RLS) sehingga admin
// tetap bisa baca semua tabel lintas users/vendor/booking tanpa ubah policy RLS.

async function requireAdmin() {
  const sb = await getServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return getServiceClient();
}

// ── Types ──

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export type AdminVendorRow = {
  id: string;
  profile_id: string;
  owner_name: string | null;
  business_name: string;
  city: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  equipment_count: number;
  created_at: string;
};

export type AdminEquipmentRow = {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  stock: number;
  condition: string;
  is_active: boolean;
  vendor_name: string;
  created_at: string;
};

export type AdminBookingRow = {
  id: string;
  renter_name: string | null;
  equipment_name: string;
  vendor_name: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  is_multi: boolean;
  item_count: number;
};

// ── Overview ──

export async function getAdminOverview() {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { count: userCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { data: vendorRows } = await supabase.from("vendors").select("id, is_active");
  const { data: equipmentRows } = await supabase.from("equipment").select("id");
  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("id, total_price, status, created_at");
  const { data: txRows } = await supabase.from("transactions").select("id");
  const { data: reviewRows } = await supabase.from("reviews").select("id");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const rows = (bookingRows ?? []) as {
    total_price: number;
    status: string;
    created_at: string;
  }[];

  const paidStatus = new Set(["dikonfirmasi", "sedang_berjalan", "selesai", "dibayar"]);
  const revenue = rows
    .filter((b) => paidStatus.has(b.status))
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  const revenueThisMonth = rows
    .filter((b) => paidStatus.has(b.status) && b.created_at >= monthStart)
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  // Revenue 6 bulan terakhir untuk chart
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const value = rows
      .filter(
        (b) => paidStatus.has(b.status) && b.created_at >= start && b.created_at < end
      )
      .reduce((sum, b) => sum + Number(b.total_price), 0);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      value,
    });
  }

  const bookingCountByStatus: Record<string, number> = {};
  for (const b of rows) {
    bookingCountByStatus[b.status] = (bookingCountByStatus[b.status] ?? 0) + 1;
  }

  return {
    error: null,
    users: userCount ?? 0,
    vendors: vendorRows?.length ?? 0,
    activeVendors:
      vendorRows?.filter((v: { is_active: boolean }) => v.is_active).length ?? 0,
    equipment: equipmentRows?.length ?? 0,
    bookings: rows.length,
    transactions: txRows?.length ?? 0,
    reviews: reviewRows?.length ?? 0,
    revenue,
    revenueThisMonth,
    revenueByMonth: months,
    bookingCountByStatus,
  };
}

// ── Users ──

export async function listUsers() {
  const supabase = await requireAdmin();
  if (!supabase) return { users: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return { users: [], error: error.message };
  return { users: (data ?? []) as AdminUserRow[], error: null };
}

export async function updateUserRole(
  userId: string,
  role: "renter" | "vendor" | "admin"
) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

// Hapus user beserta seluruh data terkait (booking, transaksi, review, notifikasi).
// User yang masih memiliki vendor harus dihapus vendornya dulu.
export async function deleteUser(userId: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (!profile) return { error: "User tidak ditemukan." };
  if (profile.role === "admin") {
    return { error: "Akun admin tidak bisa dihapus dari dashboard." };
  }

  const { count: vendorCount } = await supabase
    .from("vendors")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", userId);
  if ((vendorCount ?? 0) > 0) {
    return { error: "User masih memiliki vendor. Hapus vendornya dulu di menu Vendors." };
  }

  const { data: bookingIds } = await supabase
    .from("bookings")
    .select("id")
    .eq("renter_id", userId);
  const ids = (bookingIds ?? []).map((b) => b.id);

  if (ids.length > 0) {
    await supabase.from("transactions").delete().in("booking_id", ids);
    await supabase.from("reviews").delete().in("booking_id", ids);
    await supabase.from("notifications").delete().in("booking_id", ids);
    await supabase.from("booking_items").delete().in("booking_id", ids);
    const { error: delBookingErr } = await supabase
      .from("bookings")
      .delete()
      .in("id", ids);
    if (delBookingErr) return { error: delBookingErr.message };
  }

  await supabase.from("reviews").delete().eq("reviewer_id", userId);
  await supabase.from("notifications").delete().eq("profile_id", userId);

  const { error: delProfileErr } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (delProfileErr) return { error: delProfileErr.message };

  const { error: delAuthErr } = await supabase.auth.admin.deleteUser(userId);
  if (delAuthErr) return { error: delAuthErr.message };

  revalidatePath("/");
  return { error: null };
}

// ── Vendors ──

export async function listVendors() {
  const supabase = await requireAdmin();
  if (!supabase) return { vendors: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id, profile_id, business_name, city, whatsapp_number, is_active, created_at, profile:profiles!profile_id(full_name)"
    )
    .order("created_at", { ascending: false });

  if (error) return { vendors: [], error: error.message };

  const { data: eqCounts } = await supabase
    .from("equipment")
    .select("id, vendor_id");
  const countMap: Record<string, number> = {};
  for (const e of eqCounts ?? []) {
    countMap[e.vendor_id] = (countMap[e.vendor_id] ?? 0) + 1;
  }

  const vendors: AdminVendorRow[] = (
    data as {
      id: string;
      profile_id: string;
      business_name: string;
      city: string | null;
      whatsapp_number: string | null;
      is_active: boolean;
      created_at: string;
      profile?: { full_name: string | null }[];
    }[]
  ).map((v) => ({
    id: v.id,
    profile_id: v.profile_id,
    owner_name: v.profile?.[0]?.full_name ?? null,
    business_name: v.business_name,
    city: v.city,
    whatsapp_number: v.whatsapp_number,
    is_active: v.is_active,
    equipment_count: countMap[v.id] ?? 0,
    created_at: v.created_at,
  }));

  return { vendors, error: null };
}

export async function approveVendor(vendorId: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("vendors")
    .update({ is_active: true })
    .eq("id", vendorId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

export async function toggleVendorActive(vendorId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("vendors")
    .update({ is_active: isActive })
    .eq("id", vendorId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

// Hapus vendor beserta equipment, booking, transaksi, review, dan item terkait.
export async function deleteVendor(vendorId: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { data: equipmentIds } = await supabase
    .from("equipment")
    .select("id")
    .eq("vendor_id", vendorId);
  const eqIds = (equipmentIds ?? []).map((e) => e.id);

  if (eqIds.length > 0) {
    const { data: bookingIds } = await supabase
      .from("bookings")
      .select("id")
      .in("equipment_id", eqIds);
    const bIds = (bookingIds ?? []).map((b) => b.id);

    // Booking multi-item yang memuat equipment vendor ini juga ikut dihapus.
    const { data: multiItemBookings } = await supabase
      .from("booking_items")
      .select("booking_id")
      .in("equipment_id", eqIds);
    const mIds = (multiItemBookings ?? [])
      .map((r) => r.booking_id)
      .filter((id) => !bIds.includes(id));
    const allBookingIds = [...bIds, ...mIds];

    await supabase.from("reviews").delete().in("equipment_id", eqIds);

    if (allBookingIds.length > 0) {
      await supabase.from("transactions").delete().in("booking_id", allBookingIds);
      await supabase.from("reviews").delete().in("booking_id", allBookingIds);
      await supabase.from("notifications").delete().in("booking_id", allBookingIds);
      await supabase.from("booking_items").delete().in("booking_id", allBookingIds);
      const { error: delBErr } = await supabase
        .from("bookings")
        .delete()
        .in("id", allBookingIds);
      if (delBErr) return { error: delBErr.message };
    }

    const { error: delEqErr } = await supabase
      .from("equipment")
      .delete()
      .in("id", eqIds);
    if (delEqErr) return { error: delEqErr.message };
  }

  const { error: delVErr } = await supabase
    .from("vendors")
    .delete()
    .eq("id", vendorId);
  if (delVErr) return { error: delVErr.message };

  revalidatePath("/");
  return { error: null };
}

// ── Reviews ──

export type AdminReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
  equipment_name: string;
};

export async function listReviews() {
  const supabase = await requireAdmin();
  if (!supabase) return { reviews: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, created_at, reviewer:profiles!reviewer_id(full_name), equipment:equipment!equipment_id(name)"
    )
    .order("created_at", { ascending: false });

  if (error) return { reviews: [], error: error.message };

  const reviews: AdminReviewRow[] = (
    data as {
      id: string;
      rating: number;
      comment: string | null;
      created_at: string;
      reviewer?: { full_name: string | null }[];
      equipment?: { name: string }[];
    }[]
  ).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer_name: r.reviewer?.[0]?.full_name ?? null,
    equipment_name: r.equipment?.[0]?.name ?? "Unknown",
  }));

  return { reviews, error: null };
}

export async function deleteReview(reviewId: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

// ── Equipment ──

export async function listAllEquipment() {
  const supabase = await requireAdmin();
  if (!supabase) return { equipment: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("equipment")
    .select(
      "id, name, category, price_per_day, stock, condition, is_active, created_at, vendor_id"
    )
    .order("created_at", { ascending: false });

  if (error) return { equipment: [], error: error.message };

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, business_name");
  const vendorMap = new Map((vendors ?? []).map((v) => [v.id, v.business_name]));

  const equipment: AdminEquipmentRow[] = (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    price_per_day: Number(e.price_per_day),
    stock: e.stock,
    condition: e.condition,
    is_active: e.is_active,
    vendor_name: vendorMap.get(e.vendor_id) ?? "Unknown",
    created_at: e.created_at,
  }));

  return { equipment, error: null };
}

export async function toggleEquipmentActive(equipmentId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("equipment")
    .update({ is_active: isActive })
    .eq("id", equipmentId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

export async function deleteEquipment(equipmentId: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("equipment")
    .delete()
    .eq("id", equipmentId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

// ── Bookings ──

export async function listBookings() {
  const supabase = await requireAdmin();
  if (!supabase) return { bookings: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, quantity, start_date, end_date, total_price, status, created_at, equipment_id, equipment:equipment!equipment_id(name, vendor_id), renter:profiles!renter_id(full_name), booking_items!booking_id(quantity, equipment:equipment!equipment_id(name, vendor_id))"
    )
    .order("created_at", { ascending: false });

  if (error) return { bookings: [], error: error.message };

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, business_name");
  const vendorMap = new Map((vendors ?? []).map((v) => [v.id, v.business_name]));

  const bookings: AdminBookingRow[] = (
    data as {
      id: string;
      quantity: number;
      start_date: string;
      end_date: string;
      total_price: number;
      status: string;
      created_at: string;
      equipment_id: string | null;
      equipment?: { name: string; vendor_id: string }[];
      renter?: { full_name: string | null }[];
      booking_items?: { quantity: number; equipment?: { name: string; vendor_id: string }[] }[];
    }[]
  ).map((b) => {
    const isMulti = b.equipment_id === null;
    const parentEq = b.equipment?.[0];
    const items = isMulti ? b.booking_items ?? [] : [];

    const names = isMulti
      ? items.map((it) => it.equipment?.[0]?.name).filter(Boolean) as string[]
      : parentEq
        ? [parentEq.name]
        : [];
    const vendorId = isMulti
      ? items[0]?.equipment?.[0]?.vendor_id
      : parentEq?.vendor_id;

    return {
      id: b.id,
      renter_name: b.renter?.[0]?.full_name ?? null,
      equipment_name:
        names.length > 1 ? names.join(", ") : names[0] ?? "Unknown",
      vendor_name: vendorMap.get(vendorId ?? "") ?? "Unknown",
      quantity: b.quantity,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: Number(b.total_price),
      status: b.status,
      created_at: b.created_at,
      is_multi: isMulti,
      item_count: isMulti ? items.length : 1,
    };
  });

  return { bookings, error: null };
}

export async function adminUpdateBookingStatus(
  bookingId: string,
  newStatus: "dikonfirmasi" | "sedang_berjalan" | "selesai" | "dibatalkan"
): Promise<{ error: string | null }> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}