"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "../lib/supabase-server";

// ── Types ──

export type VendorOverview = {
  vendor: {
    id: string;
    business_name: string;
    description: string | null;
    address: string | null;
    city: string | null;
    whatsapp_number: string | null;
    is_active: boolean;
  } | null;
  equipment: VendorEquipmentItem[];
  bookings: VendorBookingItem[];
  stats: {
    equipment_count: number;
    active_count: number;
    booking_count: number;
    pending_count: number;
  };
  error: string | null;
};

export type VendorBookingItem = {
  id: string;
  equipment_name: string;
  renter_name: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
};

export type VendorEquipmentItem = {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  stock: number;
  capacity: string | null;
  condition: string;
  is_active: boolean;
  image: string | null;
  elevation: string | null;
};

type InputEquipment = {
  name: string;
  category: string;
  description?: string;
  price_per_day: number;
  stock: number;
  capacity?: string;
  condition: string;
  image_url?: string;
  elevation?: string;
};

// ── Helper: ambil vendor milik pengguna yang login ──

async function getOwnedVendor() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, vendor: null as null | { id: string }, user };
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  return { supabase, vendor, user };
}

// ── Overview: vendor + daftar alat + statistik ──

export async function getVendorOverview(): Promise<VendorOverview> {
  const { supabase, vendor, user } = await getOwnedVendor();

  if (!user) {
    return { vendor: null, equipment: [], bookings: [], stats: { equipment_count: 0, active_count: 0, booking_count: 0, pending_count: 0 }, error: "Not authenticated" };
  }
  if (!vendor) {
    return { vendor: null, equipment: [], bookings: [], stats: { equipment_count: 0, active_count: 0, booking_count: 0, pending_count: 0 }, error: "Vendor profile not found" };
  }

  // Data vendor
  const { data: vendorData } = await supabase
    .from("vendors")
    .select("id, business_name, description, address, city, whatsapp_number, is_active")
    .eq("id", vendor.id)
    .single();

  // Alat milik vendor
  const { data: equipment } = await supabase
    .from("equipment")
    .select("id, name, category, price_per_day, stock, capacity, condition, is_active, elevation")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  // Foto primary per alat
  const ids = (equipment ?? []).map((e) => e.id);
  const imageMap: Record<string, string> = {};
  if (ids.length > 0) {
    const { data: images } = await supabase
      .from("equipment_images")
      .select("equipment_id, url")
      .in("equipment_id", ids);
    for (const im of images ?? []) {
      if (!imageMap[im.equipment_id]) imageMap[im.equipment_id] = im.url;
    }
  }

  // Statistik + daftar booking
  let bookingCount = 0;
  let pendingCount = 0;
  let bookingList: VendorBookingItem[] = [];
  if (ids.length > 0) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select(`
        id,
        quantity,
        start_date,
        end_date,
        total_price,
        status,
        created_at,
        equipment:equipment!equipment_id!inner(name),
        renter:profiles!renter_id(full_name)
      `)
      .in("equipment_id", ids)
      .order("created_at", { ascending: false });
    bookingCount = bookings?.length ?? 0;
    pendingCount = (bookings ?? []).filter((b) => b.status === "menunggu_konfirmasi").length;
    bookingList = (bookings ?? []).map((b) => ({
      id: b.id,
      equipment_name: b.equipment?.[0]?.name ?? "Unknown",
      renter_name: b.renter?.[0]?.full_name ?? "Penyewa",
      quantity: b.quantity,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: Number(b.total_price),
      status: b.status,
      created_at: b.created_at,
    }));
  }

  const list: VendorEquipmentItem[] = (equipment ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    price_per_day: Number(e.price_per_day),
    stock: e.stock ?? 0,
    capacity: e.capacity,
    condition: e.condition,
    is_active: e.is_active,
    image: imageMap[e.id] ?? null,
    elevation: e.elevation ?? null,
  }));

  return {
    vendor: vendorData ?? null,
    equipment: list,
    bookings: bookingList,
    stats: {
      equipment_count: list.length,
      active_count: list.filter((e) => e.is_active).length,
      booking_count: bookingCount,
      pending_count: pendingCount,
    },
    error: null,
  };
}

// ── Create Equipment ──

export async function createEquipment(input: InputEquipment): Promise<{ error: string | null }> {
  const { supabase, vendor } = await getOwnedVendor();
  if (!vendor) return { error: "Not authenticated or no vendor profile" };

  const { data, error } = await supabase
    .from("equipment")
    .insert({
      vendor_id: vendor.id,
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      price_per_day: input.price_per_day,
      stock: input.stock,
      capacity: input.capacity ?? null,
      condition: input.condition,
      elevation: input.elevation ?? null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (data?.id && input.image_url) {
    const { error: imgError } = await supabase.from("equipment_images").insert({
      equipment_id: data.id,
      url: input.image_url,
      is_primary: true,
      sort_order: 0,
    });
    if (imgError) return { error: imgError.message };
  }

  revalidatePath("/profil/dashboard-vendor");
  return { error: null };
}

// ── Update Equipment ──

export async function updateEquipment(
  id: string,
  input: InputEquipment & { is_active?: boolean }
): Promise<{ error: string | null }> {
  const { supabase, vendor } = await getOwnedVendor();
  if (!vendor) return { error: "Not authenticated or no vendor profile" };

  // Pastikan alat milik vendor ini
  const { data: owned } = await supabase
    .from("equipment")
    .select("id")
    .eq("id", id)
    .eq("vendor_id", vendor.id)
    .single();
  if (!owned) return { error: "Equip not found" };

  const { error } = await supabase
    .from("equipment")
    .update({
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      price_per_day: input.price_per_day,
      stock: input.stock,
      capacity: input.capacity ?? null,
      condition: input.condition,
      elevation: input.elevation ?? null,
      is_active: input.is_active ?? true,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  // Update / tambah foto primary bila ada URL baru
  if (input.image_url) {
    const { data: existingImg } = await supabase
      .from("equipment_images")
      .select("id")
      .eq("equipment_id", id)
      .eq("is_primary", true)
      .single();
    if (existingImg) {
      await supabase
        .from("equipment_images")
        .update({ url: input.image_url })
        .eq("id", existingImg.id);
    } else {
      await supabase.from("equipment_images").insert({
        equipment_id: id,
        url: input.image_url,
        is_primary: true,
        sort_order: 0,
      });
    }
  }

  revalidatePath("/profil/dashboard-vendor");
  return { error: null };
}

// ── Toggle Active ──

export async function toggleEquipmentActive(
  id: string
): Promise<{ error: string | null }> {
  const { supabase, vendor } = await getOwnedVendor();
  if (!vendor) return { error: "Not authenticated or no vendor profile" };

  const { data: owned } = await supabase
    .from("equipment")
    .select("is_active")
    .eq("id", id)
    .eq("vendor_id", vendor.id)
    .single();
  if (!owned) return { error: "Equip not found" };

  const { error } = await supabase
    .from("equipment")
    .update({ is_active: !owned.is_active })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/profil/dashboard-vendor");
  return { error: null };
}

// ── Delete Equipment ──

export async function deleteEquipment(id: string): Promise<{ error: string | null }> {
  const { supabase, vendor } = await getOwnedVendor();
  if (!vendor) return { error: "Not authenticated or no vendor profile" };

  const { data: owned } = await supabase
    .from("equipment")
    .select("id")
    .eq("id", id)
    .eq("vendor_id", vendor.id)
    .single();
  if (!owned) return { error: "Equip not found" };

  await supabase.from("equipment_images").delete().eq("equipment_id", id);
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/profil/dashboard-vendor");
  return { error: null };
}