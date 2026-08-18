"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerClient } from "../lib/supabase-server";
import { getEquipmentById } from "./equipment";

// ── Row types (dipisah dari database.types yang belum sinkron) ──

type BookingRow = {
  id: string;
  renter_id: string;
  equipment_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export type BookingItemEntry = {
  equipment_id: string;
  name: string;
  category: string;
  quantity: number;
  price_per_day: number;
  subtotal: number;
};

// ── Create Booking ──

export type CreateBookingResult = {
  error: string | null;
  bookingId: string | null;
};

export async function createBooking(formData: {
  equipment_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  notes?: string;
}): Promise<CreateBookingResult> {
  const supabase = await getServerClient();

  // 1. Cek auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Kamu harus login dulu untuk booking.", bookingId: null };
  }

  // 2. Validasi tanggal
  const start = new Date(formData.start_date);
  const end = new Date(formData.end_date);

  if (end < start) {
    return {
      error: "Tanggal kembali harus setelah tanggal ambil.",
      bookingId: null,
    };
  }

  if (start < new Date(new Date().toDateString())) {
    return {
      error: "Tanggal ambil tidak boleh sebelum hari ini.",
      bookingId: null,
    };
  }

  // 3. Ambil harga alat
  const equipment = await getEquipmentById(formData.equipment_id);
  if (!equipment) {
    return { error: "Alat tidak ditemukan.", bookingId: null };
  }

  if (equipment.stock < formData.quantity) {
    return {
      error: `Stok tidak mencukupi. Tersedia ${equipment.stock} unit.`,
      bookingId: null,
    };
  }

  // 4. Hitung durasi & total
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalPrice = days * equipment.pricePerDay * formData.quantity;

  // 5. Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      renter_id: user.id,
      equipment_id: formData.equipment_id,
      quantity: formData.quantity,
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_price: totalPrice,
      status: "menunggu_konfirmasi",
      notes: formData.notes ?? null,
    })
    .select("id")
    .single();

  if (bookingError) {
    return {
      error: "Gagal membuat booking: " + bookingError.message,
      bookingId: null,
    };
  }

  revalidatePath("/booking");
  revalidatePath("/profil");
  revalidateTag("catalog", "max");

  return { error: null, bookingId: booking.id };
}

// ── Create Multi-Item Booking ──

export type CreateMultiBookingInput = {
  start_date: string;
  end_date: string;
  notes?: string;
  items: { equipment_id: string; quantity: number }[];
};

export async function createMultiBooking(
  formData: CreateMultiBookingInput
): Promise<CreateBookingResult> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Kamu harus login dulu untuk booking.", bookingId: null };
  }

  if (!formData.items || formData.items.length === 0) {
    return { error: "Keranjang masih kosong.", bookingId: null };
  }

  const start = new Date(formData.start_date);
  const end = new Date(formData.end_date);

  if (end < start) {
    return {
      error: "Tanggal kembali harus setelah tanggal ambil.",
      bookingId: null,
    };
  }

  if (start < new Date(new Date().toDateString())) {
    return {
      error: "Tanggal ambil tidak boleh sebelum hari ini.",
      bookingId: null,
    };
  }

  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Validasi stok & harga di server (jangan percaya nilai dari client)
  const ids = formData.items.map((i) => i.equipment_id);
  const { data: equipRows } = await supabase
    .from("equipment")
    .select("id, name, price_per_day, stock")
    .in("id", ids);

  if (!equipRows || equipRows.length !== ids.length) {
    return { error: "Beberapa alat tidak ditemukan.", bookingId: null };
  }

  const priceMap = new Map(
    equipRows.map((e) => [e.id, { price: Number(e.price_per_day), stock: e.stock }])
  );

  let totalPrice = 0;
  const normalizedItems: { equipment_id: string; quantity: number }[] = [];
  for (const it of formData.items) {
    const meta = priceMap.get(it.equipment_id);
    if (!meta) return { error: "Alat tidak ditemukan.", bookingId: null };
    if (meta.stock < it.quantity) {
      return {
        error: `Stok tidak mencukupi untuk salah satu alat. Tersedia ${meta.stock} unit.`,
        bookingId: null,
      };
    }
    totalPrice += days * meta.price * it.quantity;
    normalizedItems.push({ equipment_id: it.equipment_id, quantity: it.quantity });
  }

  // 1. Insert parent booking (equipment_id null untuk multi-item)
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      renter_id: user.id,
      equipment_id: null,
      quantity: normalizedItems.reduce((s, i) => s + i.quantity, 0),
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_price: totalPrice,
      status: "menunggu_konfirmasi",
      notes: formData.notes ?? null,
    })
    .select("id")
    .single();

  if (bookingError) {
    return {
      error: "Gagal membuat booking: " + bookingError.message,
      bookingId: null,
    };
  }

  // 2. Insert booking_items
  const { error: itemsError } = await supabase.from("booking_items").insert(
    normalizedItems.map((it) => {
      const meta = priceMap.get(it.equipment_id)!;
      return {
        booking_id: booking.id,
        equipment_id: it.equipment_id,
        quantity: it.quantity,
        price_per_day: meta.price,
        subtotal: days * meta.price * it.quantity,
      };
    })
  );

  if (itemsError) {
    // Rollback: hapus parent biar tidak jadi booking yatim
    await supabase.from("bookings").delete().eq("id", booking.id);
    return {
      error: "Gagal menyimpan detail booking: " + itemsError.message,
      bookingId: null,
    };
  }

  revalidatePath("/booking");
  revalidatePath("/profil");
  revalidateTag("catalog", "max");

  return { error: null, bookingId: booking.id };
}

// ── Get User's Bookings ──

export type BookingListItem = {
  id: string;
  equipment_name: string;
  equipment_category: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  vendor_name: string;
  created_at: string;
  items: BookingItemEntry[];
  isMulti: boolean;
};

export async function getUserBookings(): Promise<{
  bookings: BookingListItem[];
  error: string | null;
}> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bookings: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { bookings: [], error: error.message };
  }

  // Ambil semua equipment & vendor untuk mapping
  const { data: allEquip } = await supabase
    .from("equipment")
    .select("id, name, category, vendor_id");
  const eqMap = new Map((allEquip ?? []).map((e) => [e.id, e]));

  const { data: allVendors } = await supabase
    .from("vendors")
    .select("id, business_name");
  const vendorMap = new Map((allVendors ?? []).map((v) => [v.id, v]));

  // Ambil semua booking_items untuk semua booking user (multi-item)
  const bookingIds = (data as BookingRow[]).map((b) => b.id);
  let itemMap = new Map<string, BookingItemEntry[]>();
  if (bookingIds.length > 0) {
    const { data: items } = await supabase
      .from("booking_items")
      .select("booking_id, equipment_id, quantity, price_per_day, subtotal")
      .in("booking_id", bookingIds);
    itemMap = new Map(
      (items ?? []).map((it) => [it.booking_id, [] as BookingItemEntry[]])
    );
    for (const it of items ?? []) {
      (itemMap.get(it.booking_id) ?? itemMap.set(it.booking_id, []).get(it.booking_id)!)
        .push({
          equipment_id: it.equipment_id,
          name: "Unknown",
          category: "unknown",
          quantity: it.quantity,
          price_per_day: Number(it.price_per_day),
          subtotal: Number(it.subtotal),
        });
    }
  }

  // Lengkapi nama alat untuk booking_items
  const itemEqIds = [...new Set([...itemMap.values()].flat().map((i) => i.equipment_id))];
  if (itemEqIds.length > 0) {
    const { data: itemEq } = await supabase
      .from("equipment")
      .select("id, name, category")
      .in("id", itemEqIds);
    const nameMap = new Map((itemEq ?? []).map((e) => [e.id, e]));
    for (const list of itemMap.values()) {
      for (const it of list) {
        const eq = nameMap.get(it.equipment_id);
        it.name = eq?.name ?? "Unknown";
        it.category = eq?.category ?? "unknown";
      }
    }
  }

  const bookings: BookingListItem[] = (data as BookingRow[]).map((b) => {
    const eq = eqMap.get(b.equipment_id);
    const v = eq ? vendorMap.get(eq.vendor_id) : undefined;
    const items = itemMap.get(b.id) ?? [];
    const isMulti = !b.equipment_id;
    return {
      id: b.id,
      equipment_name:
        (isMulti ? items.map((i) => i.name).join(", ") : eq?.name) ?? "Unknown",
      equipment_category:
        isMulti ? `${items.length} alat` : (eq?.category ?? "unknown"),
      quantity: b.quantity,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: Number(b.total_price),
      status: b.status,
      vendor_name: v?.business_name ?? "Unknown",
      created_at: b.created_at,
      items,
      isMulti,
    };
  });

  return { bookings, error: null };
}

// ── Get Single Booking Detail ──

export type BookingDetail = {
  id: string;
  equipment_id: string | null;
  equipment_name: string;
  equipment_category: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  notes: string | null;
  vendor_name: string;
  vendor_whatsapp: string | null;
  vendor_address: string | null;
  created_at: string;
  items: BookingItemEntry[];
  isMulti: boolean;
};

export async function getBookingById(
  bookingId: string
): Promise<{ booking: BookingDetail | null; error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { booking: null, error: "Not authenticated" };
  }

  // Ambil booking data
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error || !data) {
    return { booking: null, error: error?.message ?? "Booking tidak ditemukan" };
  }

  const b = data as BookingRow;

  // Cek akses: hanya penyewa yang boleh lihat
  if (b.renter_id !== user.id) {
    return { booking: null, error: "Akses ditolak." };
  }

  // Ambil booking_items (multi-item)
  let items: BookingItemEntry[] = [];
  const isMulti = !b.equipment_id && bookingId.length > 0;
  if (isMulti) {
    const { data: bi } = await supabase
      .from("booking_items")
      .select("equipment_id, quantity, price_per_day, subtotal")
      .eq("booking_id", bookingId);
    const { data: bie } = await supabase
      .from("equipment")
      .select("id, name, category")
      .in("id", (bi ?? []).map((x) => x.equipment_id));
    const nm = new Map((bie ?? []).map((e) => [e.id, e]));
    items = (bi ?? []).map((x) => ({
      equipment_id: x.equipment_id,
      name: nm.get(x.equipment_id)?.name ?? "Unknown",
      category: nm.get(x.equipment_id)?.category ?? "unknown",
      quantity: x.quantity,
      price_per_day: Number(x.price_per_day),
      subtotal: Number(x.subtotal),
    }));
  }

  // Ambil equipment + vendor manual
  const { data: eqData } = await supabase
    .from("equipment")
    .select("id, name, category, vendor_id")
    .eq("id", b.equipment_id)
    .single();

  let vendorName = "Unknown";
  let vendorWhatsapp: string | null = null;
  let vendorAddress: string | null = null;

  if (eqData) {
    const { data: vData } = await supabase
      .from("vendors")
      .select("business_name, whatsapp_number, address")
      .eq("id", eqData.vendor_id)
      .single();
    if (vData) {
      vendorName = vData.business_name ?? "Unknown";
      vendorWhatsapp = vData.whatsapp_number;
      vendorAddress = vData.address;
    }
  }

  return {
    booking: {
      id: b.id,
      equipment_id: eqData?.id ?? null,
      equipment_name:
        (isMulti ? items.map((i) => i.name).join(", ") : eqData?.name) ?? "Unknown",
      equipment_category:
        isMulti ? `${items.length} alat` : (eqData?.category ?? "unknown"),
      quantity: b.quantity,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: Number(b.total_price),
      status: b.status,
      notes: b.notes,
      vendor_name: vendorName,
      vendor_whatsapp: vendorWhatsapp,
      vendor_address: vendorAddress,
      created_at: b.created_at,
      items,
      isMulti,
    },
    error: null,
  };
}

// ── Cancel Booking ──

export async function cancelBooking(
  bookingId: string
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Cek: hanya penyewa yang bisa cancel booking miliknya
  const { data: booking } = await supabase
    .from("bookings")
    .select("renter_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "Booking tidak ditemukan." };
  }

  if (booking.renter_id !== user.id) {
    return { error: "Kamu tidak punya akses untuk membatalkan booking ini." };
  }

  if (booking.status === "selesai" || booking.status === "dibatalkan") {
    return { error: "Booking sudah selesai atau sudah dibatalkan sebelumnya." };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "dibatalkan" })
    .eq("id", bookingId);

  if (error) {
    return { error: "Gagal membatalkan booking: " + error.message };
  }

  revalidatePath("/booking");
  revalidatePath("/profil");

  return { error: null };
}

// ── Vendor: Get Bookings for Vendor's Equipment ──

export async function getVendorBookings(): Promise<{
  bookings: BookingListItem[];
  error: string | null;
}> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bookings: [], error: "Not authenticated" };
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!vendor) {
    return { bookings: [], error: "Vendor profile not found" };
  }

  // Semua alat milik vendor ini
  const { data: myEquip } = await supabase
    .from("equipment")
    .select("id, name, category")
    .eq("vendor_id", vendor.id);
  const myEquipIds = new Set((myEquip ?? []).map((e) => e.id));
  const equipInfo = new Map(
    (myEquip ?? []).map((e) => [e.id, e as { id: string; name: string; category: string }])
  );

  // Semua booking
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      renter_id,
      equipment_id,
      quantity,
      start_date,
      end_date,
      total_price,
      status,
      created_at,
      renter:profiles!renter_id(full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { bookings: [], error: error.message };
  }

  // Semua booking_items untuk dipetakan
  const bookingRows = data as unknown as (BookingRow & { renter: { full_name: string }[] })[];
  const ids = bookingRows.map((b) => b.id);
  let itemRows: (BookingItemEntry & { booking_id: string })[] = [];
  if (ids.length > 0) {
    const { data: items } = await supabase
      .from("booking_items")
      .select("booking_id, equipment_id, quantity, price_per_day, subtotal")
      .in("booking_id", ids);
    const ieq = await supabase
      .from("equipment")
      .select("id, name")
      .in("id", (items ?? []).map((x) => x.equipment_id));
    const nm = new Map((ieq.data ?? []).map((e) => [e.id, e.name]));
    itemRows = (items ?? []).map((x) => ({
      booking_id: x.booking_id,
      equipment_id: x.equipment_id,
      name: nm.get(x.equipment_id) ?? "Unknown",
      category: "alat",
      quantity: x.quantity,
      price_per_day: Number(x.price_per_day),
      subtotal: Number(x.subtotal),
    }));
  }

  const bookings: BookingListItem[] = bookingRows
    .filter((b) => {
      // Pilih booking yang alatnya (langsung atau via items) milik vendor ini
      if (b.equipment_id) return myEquipIds.has(b.equipment_id);
      return (itemRows ?? [])
        .filter((i) => i.booking_id === b.id)
        .some((i) => myEquipIds.has(i.equipment_id));
    })
    .map((b) => {
      const items = (itemRows ?? []).filter((i) => i.booking_id === b.id);
      const isMulti = !b.equipment_id;
      // Untuk booking single: nama dari equipment langsung
      let name = "";
      let category = "";
      if (isMulti) {
        name = items.map((i) => i.name).join(", ");
        category = `${items.length} alat`;
      } else {
        const eq = myEquipIds.has(b.equipment_id!) ? equipInfo.get(b.equipment_id!) : null;
        name = eq?.name ?? "Unknown";
        category = eq?.category ?? "unknown";
      }
      return {
        id: b.id,
        equipment_name: name,
        equipment_category: category,
        quantity: b.quantity,
        start_date: b.start_date,
        end_date: b.end_date,
        total_price: Number(b.total_price),
        status: b.status,
        vendor_name: b.renter?.[0]?.full_name ?? "Unknown",
        created_at: b.created_at,
        items,
        isMulti,
      };
    });

  return { bookings, error: null };
}

// ── Vendor: Update Booking Status ──

export async function updateBookingStatus(
  bookingId: string,
  newStatus: "dikonfirmasi" | "sedang_berjalan" | "selesai" | "dibatalkan"
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (error) {
    return { error: "Gagal update status: " + error.message };
  }

  revalidatePath("/booking");
  revalidatePath("/profil/dashboard-vendor");

  return { error: null };
}
