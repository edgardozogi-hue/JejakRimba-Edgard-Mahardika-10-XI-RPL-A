"use server";

import { getServerClient } from "../lib/supabase-server";

const MIDTRANS_API_URL = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";

// ── Create Snap Transaction Token ──

export type SnapTokenResult = {
  token: string | null;
  redirect_url: string | null;
  error: string | null;
};

export async function createSnapToken(
  bookingId: string
): Promise<SnapTokenResult> {
  const supabase = await getServerClient();

  // 1. Cek auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { token: null, redirect_url: null, error: "Not authenticated" };

  // 2. Ambil booking
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingErr || !booking) {
    return { token: null, redirect_url: null, error: "Booking tidak ditemukan" };
  }

  // Ambil equipment + renter manual
  const { data: eq } = await supabase
    .from("equipment")
    .select("name")
    .eq("id", booking.equipment_id)
    .single();

  // Profile mungkin belum ada, pakai data user auth sebagai fallback
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", booking.renter_id)
    .maybeSingle();

  const customerEmail = profile?.email 
    || user.email 
    || `${bookingId.substring(0, 8)}@placeholder.com`;
  const customerName = profile?.full_name 
    || user.user_metadata?.full_name 
    || "User";

  if (!SERVER_KEY) {
    return { token: null, redirect_url: null, error: "Midtrans server key belum dikonfigurasi" };
  }

  // 3. Panggil Midtrans Snap API
  const payload = {
    transaction_details: {
      order_id: bookingId,
      gross_amount: Number(booking.total_price),
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: profile?.phone ?? user.phone ?? "",
    },
    item_details: [
      {
        id: bookingId,
        price: Number(booking.total_price),
        quantity: 1,
        name: `Sewa ${eq?.name ?? "Alat Camping"}`,
      },
    ],
    credit_card: {
      secure: true,
    },
  };

  try {
    const res = await fetch(`${MIDTRANS_API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + Buffer.from(SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        token: null,
        redirect_url: null,
        error: data.error_messages?.join(", ") ?? "Gagal membuat transaksi Midtrans",
      };
    }

    // 4. Catat transaksi (optional — abaikan kalo tabel belum ada)
    try {
      await supabase.from("transactions").insert({
        booking_id: bookingId,
        status: "menunggu",
      });
    } catch {
      // transactions table mungkin belum dibuat — skip
    }

    return {
      token: data.token,
      redirect_url: data.redirect_url,
      error: null,
    };
  } catch (err) {
    return { token: null, redirect_url: null, error: err instanceof Error ? err.message : "Gagal konek Midtrans" };
  }
}
