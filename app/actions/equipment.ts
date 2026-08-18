"use server";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { getServerClient } from "../lib/supabase-server";
import type { EquipmentCategory, EquipmentFrontend } from "../lib/database.types";
import {
  CATEGORY_MAP_REVERSE,
  CONDITION_MAP_REVERSE,
} from "../lib/database.types";

// ── Tipe untuk frontend ada di database.types.ts ──

const PLACEHOLDER_MAP: Record<string, string> = {
  tenda: "/placeholders/tenda.svg",
  carrier: "/placeholders/carrier.svg",
  sleeping_bag: "/placeholders/sleeping-bag.svg",
  kompor: "/placeholders/kompor.svg",
  matras: "/placeholders/matras.svg",
  jaket: "/placeholders/jaket.svg",
};

// ── Public read-only client (tanpa cookies) untuk data katalog publik ──

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cache 60 detik — katalog, vendor, dan rating di-cache server-side.
// Sebelumnya /katalog menjalankan ~10 query Supabase berurutan tiap request
// (termasuk loop N+1 untuk rating per alat), makanya navigasi lambat.
const getCatalogData = unstable_cache(
  async () => {
    const supabase = getPublicClient();

    // 1. Semua vendor aktif
    const { data: vendors } = await supabase
      .from("vendors")
      .select("id, business_name, address, city")
      .eq("is_active", true);

    // 2. Semua equipment aktif
    const { data: equipment, error } = await supabase
      .from("equipment")
      .select(`
        id,
        name,
        category,
        price_per_day,
        stock,
        condition,
        capacity,
        elevation,
        is_active,
        vendor_id
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getCatalogData error:", error.message);
      return { vendors: [], equipment: [], ratings: [] };
    }

    // 3. Rating diambil SEKALI dalam satu query batch (hilangkan N+1)
    const ids = (equipment ?? []).map((e) => e.id);
    let ratings: { equipment_id: string; rating: number }[] = [];
    if (ids.length > 0) {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("equipment_id, rating")
        .in("equipment_id", ids);
      ratings = (reviews ?? []) as { equipment_id: string; rating: number }[];
    }

    // 4. Foto primary dari equipment_images (sekali query, tanpa N+1)
    const imageMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: images } = await supabase
        .from("equipment_images")
        .select("equipment_id, url, is_primary")
        .in("equipment_id", ids);
      for (const im of images ?? []) {
        if (!imageMap[im.equipment_id]) imageMap[im.equipment_id] = im.url;
      }
    }

    return { vendors: vendors ?? [], equipment: equipment ?? [], ratings, imageMap };
  },
  ["jejak-rimba-catalog"],
  { revalidate: 60, tags: ["catalog"] }
);

// ── Get All Equipment ──

export async function getEquipmentList(filters?: {
  category?: string;
  location?: string;
  search?: string;
  onlyAvailable?: boolean;
  sort?: "Termurah" | "Termahal" | "Stok Terbanyak";
}): Promise<EquipmentFrontend[]> {
  const { vendors, equipment, ratings, imageMap = {} } = await getCatalogData();

  const vendorMap = new Map((vendors ?? []).map((v) => [v.id, v]));

  const ratingMap = new Map<string, { sum: number; count: number }>();
  for (const r of ratings) {
    const agg = ratingMap.get(r.equipment_id) ?? { sum: 0, count: 0 };
    agg.sum += r.rating;
    agg.count += 1;
    ratingMap.set(r.equipment_id, agg);
  }

  // 3. Map ke frontend format (manual vendor join)
  const items: EquipmentFrontend[] = (equipment ?? []).map((item) => {
    const vendor = vendorMap.get(item.vendor_id);
    const agg = ratingMap.get(item.id);
    return {
      id: item.id,
      name: item.name,
      category: CATEGORY_MAP_REVERSE[item.category] ?? String(item.category),
      pricePerDay: Number(item.price_per_day),
      stock: item.stock ?? 0,
      location: vendor?.address ?? vendor?.city ?? "Malang Raya",
      provider: vendor?.business_name ?? "Mitra Jejak Rimba",
      capacity: item.capacity,
      condition: CONDITION_MAP_REVERSE[item.condition] ?? String(item.condition),
      image: imageMap[item.id] ?? PLACEHOLDER_MAP[item.category] ?? "/placeholders/tenda.svg",
      rating: agg ? agg.sum / agg.count : 0,
      reviewCount: agg?.count ?? 0,
      elevation: item.elevation,
    };
  });

  // 4. Apply filters
  let filtered = [...items];

  if (filters?.location && filters.location !== "Semua") {
    filtered = filtered.filter((e) => e.location === filters.location);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.provider.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }

  if (filters?.onlyAvailable) {
    filtered = filtered.filter((e) => e.stock > 0);
  }

  if (filters?.sort) {
    switch (filters.sort) {
      case "Termurah":
        filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "Termahal":
        filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "Stok Terbanyak":
        filtered.sort((a, b) => b.stock - a.stock);
        break;
    }
  }

  return filtered;
}

// ── Get Single Equipment ──

export async function getEquipmentById(
  id: string
): Promise<EquipmentFrontend | null> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("equipment")
    .select(`
      id,
      name,
      category,
      description,
      price_per_day,
      stock,
      condition,
      capacity,
      elevation,
      is_active,
      vendor_id
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const item = data as {
    id: string;
    name: string;
    category: string;
    description: string | null;
    price_per_day: number;
    stock: number;
    condition: string;
    capacity: string | null;
    elevation: string | null;
    is_active: boolean;
    vendor_id: string;
  };

  // Ambil vendor manual
  const { data: vendor } = await supabase
    .from("vendors")
    .select("business_name, address, city, whatsapp_number")
    .eq("id", item.vendor_id)
    .single();

  // Ambil rating inline
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("equipment_id", id);

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;
  const reviewCount = reviews?.length ?? 0;

  // Foto primary
  const { data: images } = await supabase
    .from("equipment_images")
    .select("url, is_primary")
    .eq("equipment_id", id)
    .order("is_primary", { ascending: false })
    .limit(1);
  const primaryUrl = images?.[0]?.url ?? null;

  return {
    id: item.id,
    name: item.name,
    category: CATEGORY_MAP_REVERSE[item.category] ?? String(item.category),
    pricePerDay: Number(item.price_per_day),
    stock: item.stock ?? 0,
    location: vendor?.address ?? vendor?.city ?? "Malang Raya",
    provider: vendor?.business_name ?? "Mitra Jejak Rimba",
    capacity: item.capacity,
    condition: CONDITION_MAP_REVERSE[item.condition] ?? String(item.condition),
    image: primaryUrl ?? PLACEHOLDER_MAP[item.category] ?? "/placeholders/tenda.svg",
    rating: avgRating,
    reviewCount,
    elevation: item.elevation,
  };
}

// ── Get Unique Categories ──

export async function getCategories(): Promise<string[]> {
  const { equipment } = await getCatalogData();

  const cats = (equipment ?? []).map((d) =>
    CATEGORY_MAP_REVERSE[d.category as EquipmentCategory]
  );
  return [...new Set(cats)];
}
